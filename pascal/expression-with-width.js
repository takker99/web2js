import Environment from "./environment.js";


export default class ExpressionWithWidth {
  /**
   * @param {any} expression
   * @param {number} width
   */
  constructor(expression,width) {
    this.expression = expression;
    this.width = width;
  }

  /**
   * @param {Environment} e
   */
  generate(e) {
    // FIXME: ignore width specification
    return this.expression.generate(e);
  }
};
