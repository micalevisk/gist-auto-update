const debug = require('debug');
const { name } = require('../package.json');

/**
 * @param {string=} context
 */
module.exports = context => debug(context ? `${name}:${context}` : name);
