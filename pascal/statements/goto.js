/** @typedef{import("../statement.ts").Statement} Statement */

/** @implements{Statement} */
export default class Goto {
  /**
   * @param {string} label
   */
  constructor(label) {
    this.label = label;
  }

  /** @returns {string[]} */
  gotos() {
    return [this.label];
  }

  /**
   * @param {import("../environment.js").default} environment
   */
  generate(environment) {
    var module = environment.module;

    var label = environment.resolveLabel(this.label);

    if (label) {
      return label.generate(environment);
    }

    var e = environment;
    while (e !== undefined && e.name === undefined) {
      e = e.parent;
    }

    if (e) {
      throw `Could not find label ${this.label} in ${e.name}`;
    } else {
      throw `Could not find label ${this.label} in main`;
    }

    return module.return();
  }
}
