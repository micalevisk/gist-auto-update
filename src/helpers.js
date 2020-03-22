const md = require('markdown-it')();
const escapeHtml = require('escape-html');

const TAG_EMOJIS = {
  book: '📖',
  read: '🧐',
  learn: '🧠',
  vide: '👀',
  playlist: '💾',
};

/** @type {{[k in TodoistSyncAPI.PRIORITY_LEVELS]: string}} */
const PRIORITY_EMOJIS = {
  1: '',
  2: '🏁',
  3: '🏴',
  4: '🚩',
};

/**
 *
 * @param {string} tag
 * @returns {string}
 */
module.exports.resolveTag = tag => (tag && TAG_EMOJIS[tag.toLowerCase()]) || '';

/**
 *
 * @param {TodoistSyncAPI.PRIORITY_LEVELS} taskPriority
 * @returns {string}
 */
module.exports.resolvePriority = taskPriority =>
  ((PRIORITY_EMOJIS[taskPriority | 0] || '') + ' ').trimStart();

/**
 *
 * @param {Task[]} tasks
 * @returns {boolean}
 */
module.exports.isSomeTaskHasTag = tasks => !!tasks.find(task => task.content.tag);

/**
 *
 * @param {string} str
 * @returns {string}
 */
module.exports.formatAsPending = str => `<strong>${str}</strong>`;

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
