import Identifier from "./identifier.js";

export default class SingleCharacter {
  /**
   * @param {string} character
   */
  constructor(character) {
    this.character = character;
    this.type = new Identifier("char");
  }

  /**
   * @param {import("./environment.js").default} environment
   */
  generate(environment) {
    var m = environment.module;
    var c = this.character;
    return m.i32.const(c.charCodeAt(0));
  }
}
