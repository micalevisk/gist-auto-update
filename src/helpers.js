const md = require('markdown-it')();
const escapeHtml = require('escape-html');

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

/**
 *
 * @param {string} tag
 * @returns {string}
 */
module.exports.resolveTag = (tag) => {
  return EMOJIS.get(tag);
};

/**
 *
 * @param {Task[]} tasks
 * @returns {boolean}
 */
module.exports.isSomeTaskHasTag = tasks =>
  !!tasks.find(task => task.content.tag);

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
};
