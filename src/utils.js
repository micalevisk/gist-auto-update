/**
 *
 * @param {object} tableColumns
 * @param {string[]} tableColumns.separators
 * @param {string[]} tableColumns.names
 * @param {{ [key: string]: string }[]} content
 * @returns {string}
 */
export function jsonToMarkdownTable(tableColumns, content) {
  return `${ tableColumns.names.join('|') }
${ tableColumns.separators.join('|') }
${ content.map(row =>
                tableColumns.names.map(col => row[col].replace(/\|/g, '\\|') || '' )
                       .join('|'))
          .join('\n') }`
}

/**
 *
 * @param {string} str
 * @returns {string}
 */
export const removeYouTubeKeyword = (str) => str.replace(/ - YouTube$/, '');

/**
 *
 * @param {string} str
 * @returns {string}
 */
export const formatAsPending = (str) => `**${str}**`;

/**
 *
 * @param {string} str
 * @returns {string}
 */
export const formatAsTitle = (str) => `# ${str}\n`;

/**
 *
 * @param {string} text
 * @param {string} link
 * @returns {string}
 */
export const formatAsHyperlink = (text, link) => `[${text}](${link})`;

/**
 *
 * @param {string} projectName
 * @param {number} numberTasks
 * @returns {string}
 */
export const toFilename = (projectName, numberTasks) => `${projectName}_${numberTasks}.md`;

/**
 *
 * @param {string[]} strs
 * @returns {string}
 */
export const findLongestString = (strs = []) =>
  strs.sort((str1, str2) => str2.length - str1.length)[0];

/**
 *
 * @param {number} percent
 * @param {number} size
 * @returns {string}
 */
export const generateBarChart = (percent, size) => {
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
}
