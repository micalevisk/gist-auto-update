const md = require('markdown-it')();
const escapeHtml = require('escape-html');


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
  const htmlText = md.renderInline(escapedText);
  if (!link || !link.trim()) {
    return escapedText;
  }
  return `<a href="${link}" target="_blank">${htmlText}</a>`;
}
