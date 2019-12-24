import debug from 'debug';
import { name } from '../package.json';

/**
 * @param {string=} context
 */
export default context => debug(context ? `${name}:${context}` : name);
