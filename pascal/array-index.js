import Environment from './environment.js';

export default class ArrayIndex {
  /**
   * @param {import('./expression.js').Expression} index
   */
  constructor(index) {
    this.index = index;
  }

  /**
   * @param {Environment} block
   */
  generate(block) {
    return this.index.generate(block);
  }
};
