
import Environment from '../environment.js';

var count = 1;

/** @typedef{import("../statement.js").Statement} Statement */

/** @implements{Statement} */
export default class LabeledStatement {
  /**
   * @param {string} label
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
   * @param {Environment} environment
   */
  generate(environment) {
    environment = new Environment(environment);

    var module = environment.module;

    var loopLabel = `goto${count}`;
    count = count + 1;

    environment.labels[ this.label ] = {
      label: loopLabel,
      generate: function(/** @type {{ module: any; }} */ environment) {
        var module = environment.module;
        return module.break( this.label );
      }
    };

    return module.loop( loopLabel,
                        this.statement.generate( environment ) );

  }
};
