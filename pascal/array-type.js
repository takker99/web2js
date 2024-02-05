import Environment from './environment.js';
import Identifier from './identifier.js';
import SubrangeType from './subrange-type.js';

export default class ArrayType {
  /**
   * @param {Identifier|SubrangeType} index
   * @param {SubrangeType} componentType
   * @param {boolean} [packed]
   */
  constructor(index, componentType, packed) {
    this.index = index;
    this.componentType = componentType;
  }

  /**
   * @param {unknown} _
   */
  bytes(_) {
    var bytesPerEntry = this.componentType.bytes();
    return this.index.range(_) * bytesPerEntry;
  }

  /**
   * @param {unknown} _
   */
  initializer(_) {
    if (this.componentType.intish) {
      var intish = this.componentType.intish();
      return `new ${intish}Array(${this.index.range(_)})`;
    }

    return "{}";
  }

  /**
   * @param {Environment} e
   */
  generate(e) {
    return `array indexed by ${this.index.generate(e)} of ${this.componentType.generate(e)}`;
  }
};
