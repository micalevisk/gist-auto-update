// @ts-check
/// <reference path="../globals.d.ts" />

require('dotenv-safe').config({
  allowEmptyValues: false,
  example: '.env.example',
  path: '.env',
});

import projectNames from '../projectNames.json';
import debug from './debug';
import getProjects from './projects';
import Gist from './gist';
import * as _ from './utils';

const log = debug();

const {
  GIST_ID,
  GH_TOKEN,
} = process.env;

const gist = new Gist(GH_TOKEN);


/**
 *
 * @param {ProjectMeta[]} projectsMeta
 * @param {string[]} projectNames
 * @returns {GistFile}
 */
function createProgressGistFile(projectsMeta, projectNames) {
  if (projectsMeta.length !== projectNames.length) {
    throw Error('The `projectsMeta` and `projectNames` are not with same length.');
  }

  const lines = [];
  const maxPadEnd = _.findLongestString(projectNames).length;
  for (let i = 0; i < projectNames.length; ++i) {
    const projectName = projectNames[i];
    const percent = (projectsMeta[i].numberTasksDone/projectsMeta[i].numberTasks)*100;
    const line = [
      projectName.padEnd(maxPadEnd),
      _.generateBarChart(percent, 21),
      percent.toFixed(1).toString().padStart(5) + '%',
    ];
    lines.push(line.join(' '));
  }

  return {
    filename: '.progress.',
    content: lines.join('\n'),
  };
}

/**
 *
 * @param {ProjectMeta[]} projectsMeta
 * @param {string[]} projectNames
 * @returns {GistFile}
 */
function createSummaryGistFile(projectsMeta, projectNames) {
  if (projectsMeta.length !== projectNames.length) {
    throw Error('The `projectsMeta` and `projectNames` are not with same length.');
  }

  const lines = [
    _.formatAsTitle('summary'),
  ];
  for (let i = 0; i < projectNames.length; ++i) {
    const projectName = projectNames[i];
    const line = `- ${_.formatAsHyperlink(projectName, projectsMeta[i].fileHyperlinkRef)}`;
    lines.push(line);
  }

  return {
    filename: '.summary.md',
    content: lines.join('\n'),
  };
}

/**
 *
 * @param {ProjectMetaWithGistFile[]} newFilesWithPercent
 * @returns {Promise<number>} Resolves to status code.
 */
function updateGist(newFilesWithPercent) {
  /** @type {[ProjectMeta[], GistFile[]]} */
  const [projectsMeta, newFiles] = newFilesWithPercent.reduce((acum, curr) => {
    acum[0].push(curr[0]);
    acum[1].push(curr[1]);
    return acum;
  }, [[], []]);

  const updatedAtDate = (new Date()).toLocaleString('pt-BR', {timeZone: 'America/Manaus'})
  const newDescription = `📋 Reading List (updated at: ${updatedAtDate} [America/Manaus])`;
  return gist.updateGistById({
    gistId: GIST_ID,
    newDescription,
    newFiles: [
      createProgressGistFile(projectsMeta, projectNames),
      createSummaryGistFile(projectsMeta, projectNames),
      ...newFiles,
    ],
  });
}

/**
 *
 * @param {import('promise.allsettled').PromiseResult<ProjectMetaWithGistFile, unknown>[]} results
 * @returns {ProjectMetaWithGistFile[]}
 */
function filterFulfilledPromises(results) {
  return results.reduce((acum, curr) => {
    if (curr.status === 'fulfilled') {
      acum.push(curr.value);
    }
    return acum;
  }, []);
}

getProjects(projectNames)
  .then(filterFulfilledPromises)
  .then(updateGist)
  .then(statusCode => { log('gist update exit with status code: %d', statusCode); return statusCode; })
  .catch(console.error);
