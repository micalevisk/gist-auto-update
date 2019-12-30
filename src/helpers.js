const escapeHtml = require('escape-html');

/**
 *
 * @param {string} str
 * @returns {string}
 */
module.exports.removeYouTubeKeyword = (str) =>
  str.replace(/ - YouTube$/, '');

/**
 *
 * @param {string} str
 * @returns {string}
 */
module.exports.formatAsPending = (str) =>
  `<strong>${str}</strong>`;

/**
 *
 * @param {string} text
 * @param {string} link
 * @returns {string}
 */
module.exports.formatAsHyperlink = (text, link) => {
  const escapedText = escapeHtml(text);
  if (!link || !link.trim()) {
    return escapedText;
  }
  return `<a href="${link}" target="_blank">${escapedText}</a>`;
}
