export default class ArrayIndex {
  /**
   * @param {import('./expression.ts').Expression} index
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
}
