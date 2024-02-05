import Binaryen from 'binaryen';
const { i32, } = Binaryen;

export default class SubrangeType {
  /**
   * @param {any} lower
   * @param {any} upper
   */
  constructor(lower, upper) {
    this.lower = lower;
    this.upper = upper;
  }

  minimum() {
    return this.lower.number;
  }

  maximum() {
    return this.upper.number;
  }

  /**
   * @param {unknown} _
   * @returns {number}
   */
  range(_) {
    return this.maximum() - this.minimum() + 1;
  }

  /**
   * @param {unknown} [_]
   * @returns {number}
   */
  bytes(_) {
    var min = this.minimum();
    var max = this.maximum();

    if ((min == 0) && (max == 255))
      return 1;

    if ((min == -127) && (max == 128))
      return 1;

    if ((min == 0) && (max == 65535))
      return 2;

    if ((min == -32767) && (max == 32768))
      return 2;

    var b = Math.log(this.range(_)) / Math.log(256);

    if (b <= 4)
      return 4;

    throw 'Subrange too big.';
  }

  isInteger() {
    return true;
  }

  binaryen() {
    return i32;
  }

  /**
   * @param {{ isInteger: () => any; lower: { number: any; }; upper: { number: any; }; }} other
   */
  matches(other) {
    if (other.isInteger())
      return true;

    if ((this.lower.number == other.lower.number) &&
      (this.upper.number == other.upper.number))
      return true;

    return false;
  }

  /**
   * @param {unknown} [_]
   */
  intish(_) {
    if ((typeof this.upper.number == "number") &&
      (typeof this.lower.number == "number")) {
      var signed = "Uint";
      var r = this.upper.number - this.lower.number;
      if (this.lower.number < 0) {
        r = r * 2;
        signed = "Int";
      }

      if (r <= 255)
        return `${signed}8`;

      if (r <= 65536)
        return `${signed}16`;

      return `${signed}32`;
    }

    return "Uint32";
  }

  /**
   * @param {unknown} _
   */
  initializer(_) {
    return `0`;
  }

  /**
   * @param {any} e
   */
  generate(e) {
    return `range ${this.lower.generate(e)}..${this.upper.generate(e)}`;
  }
}
