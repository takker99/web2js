/** @typedef {import("../statement.js").Statement} Statement */

/** @implements {Statement} */
export default class Case {
  /**
   * @param {(number|boolean)[]} label
   * @param {Statement} statement
   */
  constructor(label, statement) {
    this.label = label;
    this.statement = statement;
  }

  /** @returns {string[]} */
  gotos() {
    return this.statement.gotos();
  }

  /**
   * @param {import("../environment.js").default} environment
   * @param {number} [selector]
   * @returns {[number,unknown]}
   */
  generate(environment, selector) {
    var m = environment.module;

    /** @type{number} */
    var condition;

    var isDefault = this.label.some( function( l) { return l === true; } );

    if (isDefault) {
      condition = m.i32.const(1);
    } else {
      var conditions = this.label.map( function (l) {
        return m.i32.eq( selector, m.i32.const(l) );
      });

      condition = conditions.reduceRight( function( acc,  current) {
        return m.i32.or( acc, current );
      });
    }

    return [condition, this.statement.generate(environment)];
  }
};
