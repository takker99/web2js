import Desig from "./desig.js";
import Environment from "./environment.js";
import Identifier from "./identifier.js";

export default class Pointer {
  /**
   * @param {import("./variable.ts").VariableType} referent
   */
  constructor(referent) {
    this.referent = referent;
  }

  /**
   * @param {Environment} environment
   */
  generate(environment) {
    var module = environment.module;

    var r = this.referent.generate(environment);

    this.type = this.referent.type;

    if (this.type.fileType) {
      this.type = this.type.type;
      var t = environment.resolveType(this.type);
      /** @type {import("./variable.ts").Variable} */
      this.variable = environment.program.memory.variable(
        "",
        t,
        4,
        this.referent.variable.pointer(),
      );
      return this.variable.get();
    }

    throw "Do not know how to create pointers.";
  }
}
