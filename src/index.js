// @ts-check
/// <reference path="../globals.d.ts" />

require('dotenv-safe').config({
  allowEmptyValues: false,
  example: '.env.example',
  path: '.env',
});

import Octokit from '@octokit/rest';
import projectNames from './projectNames.json';
import getProjects from './projects';
import * as _ from './utils';

const {
  GIST_ID,
  GH_TOKEN,
} = process.env;


const octokit = new Octokit({ auth: `token ${GH_TOKEN}` });


/**
 *
 * @param {Octokit} octokit
 * @param {object} configs
 * @param {string} configs.gistId
 * @param {string} configs.newDescription
 * @param {GistFile[]} configs.newFiles
 * @returns {Promise<number>} Resolves to status code.
 */
async function updateGistById(octokit, { gistId, newDescription, newFiles }) {
  const gist = await octokit.gists.get({ gist_id: gistId });

  const gistOldFilenames = Object.keys(gist.data.files);
  const filesToDelete = gistOldFilenames.map(oldFilename => [oldFilename, null]);

  const files = newFiles.reduce((gistFiles, currGistFile) => {
    gistFiles[currGistFile.filename] = {
      content: currGistFile.content,
    };
    return gistFiles;
  // @ts-ignore
  }, Object.fromEntries(filesToDelete));

  return octokit.gists.update({
    description: newDescription,
    gist_id: gistId,
    files,
  }).then(res => res.status);
}


/**
 *
 * @param {number[]} percents
 * @param {string[]} projectNames
 * @returns {GistFile}
 */
function createProgressGistFile(percents, projectNames) {
  if (percents.length !== projectNames.length) {
    throw Error('The `percents` and `projectNames` are not with same length.');
  }

  const lines = [];
  const maxPadEnd = _.findLongestString(projectNames).length;
  for (let i = 0; i < projectNames.length; ++i) {
    const name = projectNames[i];
    const percent = percents[i];
    const line = [
      name.padEnd(maxPadEnd),
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
 * @param {GistFileWithPercent[]} newFilesWithPercent
 * @returns {Promise<number>} Resolves to status code.
 */
function updateGist(newFilesWithPercent) {
  const [percents, newFiles] = newFilesWithPercent.reduce((acum, curr) => {
    acum[0].push(curr[0]);
    acum[1].push(curr[1]);
    return acum;
  }, [[], []]);

  const updatedAtDate = (new Date()).toLocaleString('pt-BR', {timeZone: 'America/Manaus'})
  const newDescription = `📋 Reading List (updated at: ${updatedAtDate} [America/Manaus])`;
  return updateGistById(octokit, {
    gistId: GIST_ID,
    newDescription,
    newFiles: [
      createProgressGistFile(percents, projectNames),
      ...newFiles,
    ],
  });
}


getProjects(projectNames)
  .then(updateGist)
  .then(console.log)
  .catch(console.error);
