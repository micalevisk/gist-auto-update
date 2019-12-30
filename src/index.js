// @ts-check
/// <reference path="../globals.d.ts" />

require('dotenv-safe').config({
  allowEmptyValues: false,
  example: '.env.example',
  path: '.env',
});

const projectsIdByName = require('./projectsIdByName.json');
const debug = require('./debug');
const getProjects = require('./projects');
const Gist = require('./gist');
const _  = require('./utils');

const log = debug();
const logError = debug('error');

const projectNames = Object.keys(projectsIdByName);

const {
  GIST_ID,
  GH_TOKEN,
} = process.env;

const gist = new Gist(GH_TOKEN);


/**
 *
 * @param {ProjectMeta[]} projectsMeta
 * @returns {Promise<GistFile>}
 */
async function createProgressGistFile(projectsMeta) {
  const lines = [];
  const maxPadEnd = _.findLongestString(projectNames).length;
  for (const projectMeta of projectsMeta) {
    if (projectMeta.numberTasks <= 0) { // To prevent `NaN` outputs
      continue;
    }

    const percent = (1 - (projectMeta.numberPendingTasks/projectMeta.numberTasks)) * 100;
    const line = [
      projectMeta.name.padEnd(maxPadEnd),
      _.generateBarChart(percent, 21),
      percent.toFixed(1).toString().padStart(5) + '%',
    ];
    lines.push(line.join(' '));
  }

  const content = await _.renderTemplateFile('progress', {
    lines,
  });
  return {
    filename: '.progress.',
    content,
  };
}

/**
 *
 * @param {ProjectMeta[]} projectsMeta
 * @returns {Promise<GistFile>}
 */
async function createSummaryGistFile(projectsMeta) {
  const content = await _.renderTemplateFile('summary', {
    projectsMeta,
  });
  return {
    filename: '.summary.md',
    content,
  };
}

/**
 *
 * @param {ProjectMetaWithGistFile[]} newFilesWithMetadata
 * @returns {Promise<number>} Resolves to status code.
 */
async function updateGist(newFilesWithMetadata) {
  /** @type {[ProjectMeta[], GistFile[]]} */
  const [projectsMeta, newFiles] = newFilesWithMetadata.reduce((acum, curr) => {
    acum[0].push(curr[0]);
    acum[1].push(curr[1]);
    return acum;
  }, [[], []]);

  const updatedAtDate = (new Date()).toLocaleString('pt-BR', {timeZone: 'America/Manaus'})
  const newDescription = `📋 Reading List (updated at: ${updatedAtDate} [America/Manaus])`;

  const [progressFile, summaryFile] = await Promise.all([
    createProgressGistFile(projectsMeta),
    createSummaryGistFile(projectsMeta),
  ]);

  return gist.updateGistById({
    gistId: GIST_ID,
    newDescription,
    newFiles: [
      progressFile,
      summaryFile,
      ...newFiles,
    ],
  });
}

(async function start() {
  try {
    const newFilesWithMetadata = await getProjects(projectsIdByName);
    const updateStatusCode = await updateGist(newFilesWithMetadata);
    log('gist update exit with status code: %d', updateStatusCode);
  } catch (err) {
    logError(err);
    process.exit(1);
  }
})();
