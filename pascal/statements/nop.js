import Environment from "../environment.js";

/** @typedef{import("../statement.ts").Statement} Statement */

/** @implements{Statement} */
export default class Nop {
  constructor() {
  }

  /** @returns {string[]} */
  gotos() {
    return [];
  }

  /**
   * @param {Environment} environment
   */
  generate(environment) {
    environment = new Environment(environment);
    var m = environment.module;
    return m.nop();
  }
}
