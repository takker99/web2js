import Assignment from "./assignment.js";
import Operation from "../operation.js";
import NumericLiteral from "../numeric-literal.js";
import Identifier from "../identifier.js";

var count = 1;

/** @typedef{import("../statement.ts").Statement} Statement */

/** @implements{Statement} */
export default class For {
  /**
   * @param {import("../desig.js").default} variable
   * @param {import("../desig.js").default | import("../operation.js").default | import("../pointer.js").default} start
   * @param {any} end
   * @param {any} skip
   * @param {Statement} statement
   */
  constructor(variable, start, end, skip, statement) {
    this.variable = variable;
    this.start = start;
    this.end = end;
    this.skip = skip;
    this.statement = statement;
  }

  /** @returns {string[]} */
  gotos() {
    return this.statement.gotos();
  }

  /**
   * @param {import("../environment.js").default} environment
   * @return {number}
   */
  generate(environment) {
    var module = environment.module;

    var loopLabel = `for${count}`;
    var blockLabel = `for${count}-done`;
    count = count + 1;

    var end = this.end.generate(environment);

    var assignment = new Assignment(this.variable, this.start);

    var condition = module.nop();
    var initial = module.nop();
    /** @type {number|Assignment} */
    var increment = module.nop();

    if (this.skip > 0) {
      initial = module.i32.le_s(this.start.generate(environment), end);
      condition = module.i32.eq(this.variable.generate(environment), end);
      increment = new Assignment(
        this.variable,
        new Operation(
          "+",
          this.variable,
          new NumericLiteral(1, new Identifier("integer")),
        ),
      );
    } else {
      initial = module.i32.ge_s(this.start.generate(environment), end);
      condition = module.i32.eq(this.variable.generate(environment), end);
      increment = new Assignment(
        this.variable,
        new Operation(
          "-",
          this.variable,
          new NumericLiteral(1, new Identifier("integer")),
        ),
      );
    }

    var loop = module.block(blockLabel, [
      assignment.generate(environment),
      module.loop(
        loopLabel,
        module.block(null, [
          this.statement.generate(environment),
          module.if(condition, module.break(blockLabel)),
          increment.generate(environment),
          module.break(loopLabel),
        ]),
      ),
    ]);

    return module.if(initial, loop);
  }
}
