/** @typedef{import("../statement.js").Statement} Statement */

/** @implements{Statement} */
export default class Switch {
  /**
   * @param {any} expression
   * @param {Statement[]} cases
   */
  constructor(expression, cases) {
    this.expression = expression;
    this.cases = cases;
  }

  /** @returns {string[]} */
  gotos() {
    /**
     * @type {string[]}
     */
    var g = [];
    this.cases.forEach( function( f) {
      g = g.concat(f.gotos());
    });
    return g;
  }

  /**
   * @param {import("../environment.js").default} environment
   */
  generate(environment) {
    var m = environment.module;

    var previous = m.nop();

    var selector = this.expression.generate(environment);

    for (var i in this.cases.reverse()) {
      var c = this.cases[i].generate(environment, selector);
      var condition = c[0];
      var result = c[1];

      previous = m.if( condition, result, previous );
    }

    return previous;
  }
};
