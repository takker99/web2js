var count = 1;

/** @typedef{import("../statement.ts").Statement} Statement */

/** @implements{Statement} */
export default class Repeat {
  /**
   * @param {any} expression
   * @param {Statement} statement
   */
  constructor(expression, statement) {
    this.expression = expression;
    this.statement = statement;
  }

  /** @returns {string[]} */
  gotos() {
    return this.statement.gotos();
  }

  /**
   * @param {import("../environment.js").default} environment
   */
  generate(environment) {
    var module = environment.module;

    var loopLabel = `repeat${count}`;
    var blockLabel = `repeat${count}-done`;
    count = count + 1;

    var loop = module.block(blockLabel, [
      module.loop(
        loopLabel,
        module.block(null, [
          this.statement.generate(environment),
          module.if(
            this.expression.generate(environment),
            module.break(blockLabel),
            module.break(loopLabel),
          ),
        ]),
      ),
    ]);

    return loop;
  }
}
