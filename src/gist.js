const Octokit = require('@octokit/rest');
const debug = require('./debug');

const log = debug('gist');

class Gist {

  /**
   *
   * @param {string} ghToken
   */
  constructor(ghToken) {
    this.octokit = new Octokit({ auth: `token ${ghToken}` });
    log('maybe authenticated with token %o', ghToken.slice(0, 3) + '...');
  }

  /**
   *
   * @param {object} configs
   * @param {string} configs.gistId
   * @param {string} configs.newDescription
   * @param {GistFile[]} configs.newFiles
   * @returns {Promise<number>} Resolves to status code.
   */
  async updateGistById({ gistId, newDescription, newFiles }) {
    log('will get gist with id %o', gistId);
    const gistResponse = await this.octokit.gists.get({ gist_id: gistId });
    log('get done');

    const gistOldFilenames = Object.keys(gistResponse.data.files);
    const filesToDelete = gistOldFilenames.map(oldFilename => [oldFilename, null]);

    const files = newFiles.reduce((gistFiles, currGistFile) => {
      gistFiles[currGistFile.filename] = {
        content: currGistFile.content,
      };
      return gistFiles;
    }, Object.fromEntries(filesToDelete));

    log('will update gist with id %o', gistId);

    try {
      const updatedGistResponse = await this.octokit.gists.update({
        description: newDescription,
        gist_id: gistId,
        files,
      });

      log('update done!');

      return updatedGistResponse.status;
    } catch (err) {
      log('update fails!!');
      throw err;
    }
  }

}

module.exports = Gist;
