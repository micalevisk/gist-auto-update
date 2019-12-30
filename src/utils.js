const path = require('path');
const ejs = require('ejs');
const helpers = require('./helpers');

/**
 *
 * @param {string} projectName
 * @param {number} numberTasks
 * @returns {string}
 */
module.exports.toFilename = (projectName, numberTasks) => `${projectName}_${numberTasks}.md`;

/**
 *
 * @param {string[]} strs
 * @returns {string}
 */
module.exports.findLongestString = (strs = []) =>
  strs.sort((str1, str2) => str2.length - str1.length)[0];

/**
 *
 * @param {number} percent
 * @param {number} size
 * @returns {string}
 */
module.exports.generateBarChart = (percent, size) => {
  const syms = '░▏▎▍▌▋▊▉█';

  const frac = Math.floor((size * 8 * percent) / 100);
  const barsFull = Math.floor(frac / 8);
  if (barsFull >= size) {
    return syms.substring(8, 9).repeat(size);
  }
  const semi = frac % 8;

  return [
    syms.substring(8, 9).repeat(barsFull),
    syms.substring(semi, semi + 1),
  ].join('').padEnd(size, syms.substring(0, 1));
};

/**
 *
 * @param {any[]} arr
 * @param {string} key
 * @returns {object}
 */
module.exports.groupBy = (arr, key) => {
  return arr.reduce((groups, element) => {
    (groups[element[key]] = groups[element[key]] || []).push(element);
    return groups;
  }, {});
};

/**
 *
 * @param {string} templateName
 * @param {any} [data]
 * @returns {Promise<string>}
 */
module.exports.renderTemplateFile = (templateName, data = {}) =>
  ejs.renderFile(
    path.join(__dirname, 'templates', `${templateName}.template.ejs`),
    { ...data, helpers },
    { async: true });
