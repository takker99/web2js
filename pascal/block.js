import ConstantDeclaration from "./constant-declaration.js";
import Environment from "./environment.js";
import TypeDeclaration from "./type-declaration.js";

export default class Block {
  /**
   * @param {any} labels
   * @param {ConstantDeclaration[]} consts
   * @param {TypeDeclaration[]} types
   * @param {any} vars
   * @param {import("./statements/compound.js").default} compound
   */
  constructor(labels, consts, types, vars, compound) {
    this.labels = labels;
    this.consts = consts;
    this.types = types;
    this.vars = vars;
    this.compound = compound;
  }

  /**
   * @param {Environment} environment
   */
  generate(environment) {
    environment = new Environment(environment);

    this.consts.forEach(function (v) {
      environment.constants[v.name] = v.expression;
    });

    this.types.forEach(function (t) {
      environment.types[t.name] = t.expression;
    });

    return this.compound.generate(environment);
  }
}
