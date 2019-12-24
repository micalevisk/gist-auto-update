import fetch from 'node-fetch';
import debug from './debug';
import * as _ from './utils';

const { TODOIST_API_ENDPOINT } = process.env;
const log = debug('projects');

const EMOJIS = {
  '_book'    : '📖',
  '_read'    : '🧐',
  '_learn'   : '🧠',
  '_vide'    : '👀',
  '_playlist': '💾',

  /**
   *
   * @param {string} tag
   * @returns {string}
   */
  get(tag) {
    return (tag && this[ `_${tag.toLowerCase()}` ]) || '';
  }
};

const TABLE_COLUMNS = {
  separators: [':-:', ':-:', ':-'],
  names: [
    '#',
    'TAG',
    'NAME',
  ],
};


/**
 *
 * @param {Task[]} tasks
 * @param {string} projectName
 * @returns {ProjectMetaWithGistFile} The task progress and the respective gist file metadata.
 */
function makeTasksGistFileWithMetadata(tasks, projectName) {
  const numberTasks = tasks.length;
  let numberTasksDone = 0;

  const tableContent = tasks.map(({ checked, content }, idx) => {
    const row = {
      [TABLE_COLUMNS.names[0]]: `${idx + 1}`,
      [TABLE_COLUMNS.names[1]]: EMOJIS.get(content.tag),
      [TABLE_COLUMNS.names[2]]: `[${ _.removeYouTubeKeyword(content.text) }](${content.link})`,
    };

    if (checked) {
      numberTasksDone++; // side-effect
    } else {
      row[TABLE_COLUMNS.names[0]] = _.formatAsPending(row[TABLE_COLUMNS.names[0]]);
      row[TABLE_COLUMNS.names[2]] = _.formatAsPending(row[TABLE_COLUMNS.names[2]]);
    }

    return row;
  });

  const contentTitle = `${projectName} (${numberTasksDone}/${numberTasks}) ${_.formatAsHyperlink('[↥]', '#summary')}`;
  const fileHyperlinkRef = `#${projectName}-${numberTasksDone}${numberTasks}-`;

  const lines = [
    _.formatAsTitle(contentTitle),
    _.jsonToMarkdownTable(TABLE_COLUMNS, tableContent),
    _.formatAsHyperlink('[↥]', fileHyperlinkRef),
  ];

  return [
    {// project metadata
      numberTasks,
      numberTasksDone,
      fileHyperlinkRef,
    },
    {// gist file parameters
      filename: _.toFilename(projectName, numberTasks),
      content: lines.join('\n'),
    }
  ];
}

/**
 *
 * @param {string[]} projectNames
 * @returns {Promise<ProjectMetaWithGistFile[]>}
 */
export default function getProjects(projectNames) {
  log('will fetch the following projects: %o', projectNames);

  const whenProjects = projectNames.map(projectName => {
    const url = `${TODOIST_API_ENDPOINT}/?projectName=${projectName}`;
    log('fetching %o ...', url);
    return fetch(url)
      .then(data => { log('%o done', projectName); return data.json(); })
      .then(tasks => makeTasksGistFileWithMetadata(tasks, projectName))
  });

  return Promise.all(whenProjects);
}
