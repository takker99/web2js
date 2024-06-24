export default class Constant {
  /**
   * @param {string|number} name
   */
  constructor(name) {
    this.name = name;
  }

  /**
   * @param {import("./environment.js").default} environment
   * @returns {string}
   */
  generate(environment) {
    var c = environment.resolveConstant(this);

    if (c) {
      this.type = c.type;
      return `${c.generate(environment)}`;
    } else {
      throw `Could not resolve the constant ${this.name}`;
    }
  }
}
