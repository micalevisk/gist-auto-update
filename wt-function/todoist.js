// @ts-check
/// <reference path="../globals.d.ts" />
const axios = require('axios').default;
const AxiosLogger = require('axios-logger');
const uuid = require('uuid');

// @ts-ignore
Array.prototype.flat = require('array.prototype.flat').getPolyfill();

/** @type {ROOT_SECTION} */
const ROOT_SECTION = ':root';

const RE_ITEM_CONTENT = /^(?:\{([^}]+)\}\s*)?([^(\s]+)(?:\s*\((.+)\))?/;
const RE_PLAYLIST_CONTENT = /\bplaylist\b/;
const RE_IGNORE_ITEM = /\u2716:?$/;// https://apps.timwhitlock.info/unicode/inspect/hex/2716
const RE_IGNORE_SECTION = /\u2716$/;
const RE_CATEGORY_ITEM = /:$/;
const NIL = -1;


/**
 *
 * @param {string} dateStr
 * @returns {string}
 */
function formatDate(dateStr) {
  const [, day, month, year] = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return `${month} ${day}, ${year}`;
}

/**
 *
 * @param {string} content
 * @returns {TaskContent}
 */
function formatContent(content) {
  const matches = content.match(RE_ITEM_CONTENT);
  if (!matches) return {
    text: content
  };

  const [, rawTag, link, text] = matches;

  if (!link || !text) return {
    text: content
  };

  const contentMetadata = {
    link,
    text,
  };

  const tag = rawTag
    ? rawTag.toLowerCase()
    : (RE_PLAYLIST_CONTENT.test(content) && 'playlist');

  return tag
    ? { ...contentMetadata, tag }
    : contentMetadata;
}

/**
 *
 * @param {TodoistSyncAPI.ProjectData} data
 * @param {SectionMap} sectionsNameById
 * @returns {[TodoistPartialResponse, number[]]}
 */
function mapProjectDataToItems(data, sectionsNameById) {
  const { project, items } = data;

  const [wellFormattedItems, categoryIds] = formatProjectItems(items, sectionsNameById);
  const [wellFormattedNoncheckedItems, wellFormattedCheckedItems] = wellFormattedItems.reduce((itemsPair, item) => {
    itemsPair[ +item.checked ].push(item);
    return itemsPair;
  }, [[], []]);

  return [
    {
      name: project.name,
      items: {
        done: wellFormattedCheckedItems,
        pending: wellFormattedNoncheckedItems,
      }
    },
    categoryIds,
  ];
}


/**
 *
 * @param {TodoistSyncAPI.Item[]} items
 * @param {SectionMap} [sectionsNameById]
 * @returns {[Task[], number[]]}
 */
function formatProjectItems(items, sectionsNameById = { null: ROOT_SECTION }) {
  /** @param {TodoistSyncAPI.Item} item */
  const formatItem = item => ({
    checked: !!item.checked,
    dateAdded: formatDate(item.date_added),
    id: item.id,
    parentId: item.parent_id,
    sectionId: item.section_id,
    priority: item.priority,
    content: formatContent(item.content),
  });

  const selectedTasks = [];
  const categoryIds = [];
  let lastSkippedParentId = NIL;

  for (const item of items) { // Filter and format items
    const {
      id: currId,
      parent_id: currParentId,
      content: currContent,
      section_id: sectionId,
    } = item;

    if (!(sectionId in sectionsNameById)) {
      continue;
    }

    if (RE_IGNORE_ITEM.test(currContent)) { // Skip this item and nested ones
      lastSkippedParentId = currId;
      continue;
    }

    const isCategory = RE_CATEGORY_ITEM.test(currContent);
    const parentSkipped = currParentId == lastSkippedParentId;
    const skipItem = (parentSkipped || isCategory);

    if (!skipItem) {
      selectedTasks.push(formatItem(item));
    }

    if (currParentId !== lastSkippedParentId) {
      lastSkippedParentId = NIL;
    }

    if (isCategory) {
      categoryIds.push(currId);
      if (parentSkipped) {
        lastSkippedParentId = currId;
      }
    }
  }

  return [
    selectedTasks,
    categoryIds,
  ];
}


class Todoist {

  constructor(apiToken) {
    this.conn = axios.create({
      baseURL: 'https://api.todoist.com/sync/v8',
      responseType: 'json',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'X-Request-Id': uuid(),
      },
    });

    this.conn.interceptors.request.use(AxiosLogger.requestLogger, AxiosLogger.errorLogger);
  }

  /**
   *
   * @param {number} [projectId]
   * @returns {Promise<TodoistSyncAPI.Section[]>}
   */
  async getSections(projectId) {
    const { data } = await this.conn.post('sync', {
      sync_token: '*',
      resource_types: '["sections"]',
    });

    if (projectId) {
      return data.sections.filter(section => section.project_id === projectId);
    }

    return data.sections;
  };

  /**
   *
   * @param {number} projectId
   * @returns {Promise<TodoistSyncAPI.ProjectData>}
   */
  async getProjectData(projectId) {
    const { data } = await this.conn.post('projects/get_data', {
      project_id: projectId.toString()
    });
    return data;
  };

  /**
   *
   * @param {object} paramsValues
   * @param {number} [paramsValues.projectId]
   * @param {number} [paramsValues.parentId]
   * @param {number} [paramsValues.sectionId]
   * @returns {Promise<TodoistSyncAPI.ArchivedProjectData>}
   */
  async getArchivedProjectItems({projectId, parentId, sectionId}) {
    /** @type {[string,number][]} */
    const paramsKeyAndValues = [// key-value pairs in priority order
      ['project_id', projectId],
      ['parent_id', parentId],
      ['section_id', sectionId],
    ];
    const argIdx = paramsKeyAndValues.findIndex(([, argValue]) => typeof argValue === 'number');
    if (argIdx < 0) {
      throw Error('missing some argument.');
    }

    const params = { [paramsKeyAndValues[argIdx][0]]: paramsKeyAndValues[argIdx][1].toString() };
    let { data } = await this.conn.post('archive/items', params);

    while (data.has_more) { // To fetch all pages
      Object.assign(params, {
        cursor: data.next_cursor
      });

      const {
        data: nextData
      } = await this.conn.post('archive/items', params);
      nextData.items = data.items.concat(nextData.items);
      data.next_cursor = nextData.next_cursor; // this could be `undefined`
      Object.assign(data, nextData);
    }

    return data;
  }


  // /**
  //  * Async generator version of `getArchivedProjectItems` method.
  //  * @param {string} projectId
  //  * @param {string} [parentId]
  //  * @param {string} [cursor='']
  //  * @returns {AsyncGenerator<TodoistSyncAPI.ArchivedProjectData>}
  //  */
  // async * $getArchivedProjectItems(projectId, parentId, cursor = '') {
  //   const params = parentId
  //     ? { parent_id: parentId }
  //     : { project_id: projectId };
  //   Object.assign(params, { cursor });
  //   const { data } = await this.conn.post('archive/items', params);
  //   yield data;
  //   if (data.has_more) {
  //     yield* this.$getArchivedProjectItems(projectId, parentId, data.next_cursor);
  //   }
  // }

  /**
   *
   * @param {number} projectId
   * @returns {Promise<SectionMap>}
   */
  async getSectionsGroupedByProjectId(projectId) {
    const sections = await this.getSections(projectId);

    /** @type {SectionMap} */
    const sectionsNameById = sections.reduce((sectionsMap, section) => {
      if (!RE_IGNORE_SECTION.test(section.name.trim())) {
        sectionsMap[ section.id ] = formatContent(section.name);
      }
      return sectionsMap;
    }, {
      null: ROOT_SECTION,
    });

    return sectionsNameById;
  }

  /**
   *
   * @param {number} projectId
   * @param {SectionMap} [sectionsNameById]
   * @returns {Promise<[TodoistPartialResponse, number[]]>}
   */
  getWellFormattedProjectData(projectId, sectionsNameById) {
    return this.getProjectData(projectId)
      .then(data => mapProjectDataToItems(data, sectionsNameById));
  }

  /**
   *
   * @param {number} projectId
   * @param {SectionMap} [sectionsNameById]
   * @param {number[]} [parentIds]
   */
  getProjectArchivedTasks(projectId, sectionsNameById, parentIds) {
    const getTasksFromResponseData = data =>
      formatProjectItems(data.items, sectionsNameById)[0];

    const {null: _, ...projectSectionsNameById} = sectionsNameById;
    const sectionsIds = Object.keys(projectSectionsNameById).map(Number);

    const whenTasksByProjectId = this.getArchivedProjectItems({ projectId }).then(getTasksFromResponseData);
    const whenTasksBySectionId = sectionsIds.map(sectionId =>
      this.getArchivedProjectItems({ sectionId }).then(getTasksFromResponseData)
    );

    const whenAllKindTasks = [
      whenTasksByProjectId,
      whenTasksBySectionId,
    ].flat();

    if (parentIds && parentIds.length) {
      for (const parentId of parentIds) {
        const whenArchivedProjectTasks = this.getArchivedProjectItems({ projectId, parentId })
          .then(getTasksFromResponseData);
        whenAllKindTasks.push(whenArchivedProjectTasks);
      }

      return Promise.all(whenAllKindTasks)
        .then(fulfilledPromises => fulfilledPromises.flat()); // Ignoring parentId-level
    }

    return Promise.all(whenAllKindTasks);
  }

}

module.exports = Todoist;
