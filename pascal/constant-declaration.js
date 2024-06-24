export default class ConstantDeclaration {
  /**
   * @param {{ name: string; }} identifier
   * @param {number} expression
   */
  constructor(identifier, expression) {
    this.name = identifier.name;
    this.expression = expression;
  }

  toString() {
    return `const ${this.name} = ${this.expression};`;
  }
}
