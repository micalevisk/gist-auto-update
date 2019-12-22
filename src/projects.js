import fetch from 'node-fetch';
import * as _ from './utils';

const { TODOIST_API_ENDPOINT } = process.env;

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

const tableColumns = {
  separators: [':-:', ':-:', ':-'],
  names: [
    '#',
    'TAG',
    'NAME',
  ]
};

/**
 *
 * @param {Task[]} tasks
 * @param {string} projectName
 * @returns {GistFileWithPercent} The task progress and the respective gist file metadata.
 */
function makeTasksGistFileWithPercent(tasks, projectName) {
  const numberTasks = tasks.length;
  let numberTasksDone = 0;

  const tableContent = tasks.map(({ checked, content }, idx) => {
    const row = {
      [tableColumns.names[0]]: `${idx + 1}`,
      [tableColumns.names[1]]: EMOJIS.get(content.tag),
      [tableColumns.names[2]]: `[${ _.removeYouTubeKeyword(content.text) }](${content.link})`,
    };

    if (checked) {
      numberTasksDone++; // side-effect
    } else {
      row[tableColumns.names[0]] = _.formatAsPending(row[tableColumns.names[0]]);
      row[tableColumns.names[2]] = _.formatAsPending(row[tableColumns.names[2]]);
    }

    return row;
  });

  const progressPercent = (numberTasksDone/numberTasks) * 100;

  return [
    progressPercent,
    {
      filename: `${projectName}_${numberTasks}.md`,
      content: `# ${projectName} (${numberTasksDone}/${numberTasks})\n\n${_.jsonToMarkdownTable(tableColumns, tableContent)}`,
    }
  ];
}

/**
 *
 * @param {string[]} projectNames
 * @returns {Promise<GistFileWithPercent[]>}
 */
export default function getProjects(projectNames) {
  const whenProjects = projectNames.map(projectName =>
    fetch(`${TODOIST_API_ENDPOINT}/?projectName=${projectName}`)
      .then(data => data.json())
      .then(tasks => makeTasksGistFileWithPercent(tasks, projectName))
  );

  return Promise.all(whenProjects);
}
