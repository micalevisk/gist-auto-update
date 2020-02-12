/**
 * @param {array} fns - Funções que serão aplicadas.
 * @return {function}
 */
function pipe(...fns) {
  const PIPE = (f, g) => (...args) => g(f(...args));
  return fns.reduce(PIPE);
}

/**
 *
 * @param {object} obj
 * @returns {object}
 */
function onlyTruthyValuesOnPojo(obj) {
  const newObj = Object.keys(obj).reduce((newObj, prop) => {
    if (obj[prop]) {
      newObj[prop] = obj[prop];
    }
    return newObj;
  }, {});

  return newObj;
}



function makeTextContentFormatter() {
  const RE_YT_PLAYLIST = /\s-\sYouTube$/;
  const removeYouTubeKeyword = str => str.replace(RE_YT_PLAYLIST, '');

  const RE_REACT = /\s–\sReact$/;
  const removeReactKeyword = str => str.replace(RE_REACT, '');

  /**
   *
   * @param {string} text
   * @returns {string}
   */
  const textContentFormatter = text =>
    pipe(
      removeYouTubeKeyword,
      removeReactKeyword,
    )(text);

  return textContentFormatter;
}


function makeContentFormmatter() {
  const RE_PLAYLIST_CONTENT = /\bplaylist\b/;
  const RE_TAG = /^\{([^}]+)\}\s+(.+)/;
  const RE_HYPERTEXT_1 = /^\[([^\]]+)](?:\s*\((.+)\))\B/; // [This text will be hyperlinked](http://todoist.com/)
  const RE_HYPERTEXT_2 = /([^\s]+)\s+\(([^)]+)\)/;        //  http://todoist.com/ (This text will be hyperlinked)

  const formatText = makeTextContentFormatter();
  const formatTag = tag => tag && tag.toLowerCase();

  /**
   *
   * @param {string} itemContent
   * @returns {TaskContent}
   */
  function formatContent(itemContent) {
    if (typeof itemContent !== 'string') {
      throw TypeError(`content is not a string (${typeof itemContent})`);
    }

    /** @type {TaskContent} */
    const parsedContent = {
      tag: undefined,
      link: undefined,
      text: undefined,
    };

    const matchesTag = itemContent.match(RE_TAG);
    if (matchesTag) {
      [, parsedContent.tag, itemContent] = matchesTag;
    } else {
      if (RE_PLAYLIST_CONTENT.test(itemContent)) {
        parsedContent.tag = 'playlist';
      }
    }

    // Now `content` do not have a tag on it
    const matchesHypertext1 = itemContent.match(RE_HYPERTEXT_1);
    if (matchesHypertext1) {
      [, itemContent, parsedContent.link] = matchesHypertext1;
    } else {
      const matchesHypertext2 = itemContent.match(RE_HYPERTEXT_2);
      if (matchesHypertext2) {
        [, parsedContent.link, itemContent] = matchesHypertext2;
      }
    }

    parsedContent.text = formatText(itemContent);
    parsedContent.tag = formatTag(parsedContent.tag);
    return onlyTruthyValuesOnPojo(parsedContent);
  }

  return formatContent;
}


function makeDateFormatter() {
  const RE_DATE = /^(\d{4})-(\d{2})-(\d{2})/;

  const dateFormatter = (dateStr) => {
    const [, day, month, year] = dateStr.match(RE_DATE);
    return `${month} ${day}, ${year}`;
  };

  return dateFormatter;
}


module.exports = {
  formatDate: makeDateFormatter(),
  formatContent: makeContentFormmatter(),
};
