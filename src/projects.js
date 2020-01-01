const fetch = require('node-fetch').default;
const debug = require('./debug');
const _ = require('./utils');

const { TODOIST_API_ENDPOINT } = process.env;
const log = debug('projects');


/**
 *
 * @param {number} projectId
 * @param {TodoistAccessResponse} projectData
 * @param {string} [projectName=projectData.name]
 * @returns {Promise<ProjectMetaWithGistFile>} The task progress and the respective gist file metadata.
 */
async function makeTasksGistFileWithMetadata(projectId, projectData, projectName = projectData.name) {
  const numberPendingTasks = projectData.items.pending.length; // ??
  const {
    total: numberTasks,
    sectionsNameById,
  } = projectData;

  /** @type {ItemsBySectionName} */
  const pendingGroupedBySectionId = _.groupBy(projectData.items.pending, 'sectionId');
  const { null: rootTasks = [], ...remainingTasksBySectionId} = pendingGroupedBySectionId; // TODO: identificar como 'pending'

  /** @type {ItemsBySectionName} */
  const archivedGroupedBySectionId = _.groupBy(projectData.items.archived, 'sectionId');
  const {
    null: archivedRootTasks = [],
    ...archivedRemainingTasksBySectionId
  } = archivedGroupedBySectionId;

  const content = await _.renderTemplateFile('project', {
    projectId,
    projectName,

    rootTasks,
    tasksInSections: Object.entries(remainingTasksBySectionId),

    archived: projectData.items.archived,
    archivedRootTasks,
    archivedTasksInSections: Object.entries(archivedRemainingTasksBySectionId),

    sectionsNameById,
  });
  return [
    {// project metadata
      id: projectId,
      name: projectName,
      numberTasks,
      numberPendingTasks,
    },
    {// gist file parameters
      filename: _.toFilename(projectName, numberTasks),
      content,
    }
  ];
}

/**
 *
 * @param {number} projectId
 * @returns {Promise<TodoistAccessResponse>}
 */
const fetchProjectData = (projectId) => {
  const url = new URL(TODOIST_API_ENDPOINT);
  url.search = new URLSearchParams({ projectId: projectId.toString() }).toString();
  log('fetching project %o ...', url.href);
  return fetch(url).then(res => res.json())
    .then((data) => {
      if ('error' in data) throw data;
      return data;
    });
};

/**
 *
 * @param {{[k:string]:number}} projectsIdByName
 * @returns {Promise<ProjectMetaWithGistFile[]>}
 */
module.exports = async function getProjects(projectsIdByName) {
  log('will fetch the following projects: %o', projectsIdByName);

  const whenProjects = [];
  for (const projectName in projectsIdByName) {
    const projectId = projectsIdByName[projectName];
    const projectData = await fetchProjectData(projectId);
    log('fetch project %d done', projectId);
    if (projectData.total > 0) {
      const whenGistFileWithMetadata = makeTasksGistFileWithMetadata(projectId, projectData, projectName);
      whenProjects.push(whenGistFileWithMetadata);
    }
  }

  return Promise.all(whenProjects);
}
