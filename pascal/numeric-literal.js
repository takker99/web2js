
import Binaryen from 'binaryen';
import Environment from './environment.js';
import Identifier from './identifier.js';

export default class NumericLiteral {
  /**
   * @param {number} n
   * @param {Identifier} [type]
   */
  constructor(n, type) {
    this.number = n;

    if (type)
      this.type = type;
    else
      this.type = new Identifier("integer");
  }

  /**
   * @param {Environment} environment
   * @returns {Binaryen.ExpressionId}
   */
  generate(environment) {
    environment = new Environment(environment);
    var m = environment.module;

    if (this.type.name == "integer")
      return m.i32.const( this.number );

    if (this.type.name == "boolean")
      return m.i32.const( this.number );

    if (this.type.name == "real")
      return m.f32.const( this.number );

    throw `Could not create numeric constant for ${this.number} with ${this.type}`;
    return m.nop();
  }
};
