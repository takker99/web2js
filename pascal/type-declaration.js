import Environment from "./environment.js";


export default class TypeDeclaration {
  /**
   * @param {{ name: Environment; }} identifier
   * @param {Environment} expression
   */
  constructor(identifier,expression) {
    this.name = identifier.name;
    this.expression = expression;
  }

  /**
   * @param {Environment} e
   */
  generate(e) {
    return `// type ${this.name.generate(e)} = ${this.expression.generate(e)};`;
  }

};
