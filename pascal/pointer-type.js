import Binaryen from "../deps/binaryen.ts";
const { i32 } = Binaryen;

export default class PointerType {
  /**
   * @param {any} referent
   */
  constructor(referent) {
    this.referent = referent;
  }

  /**
   * @param {unknown} _
   */
  binaryen(_) {
    return i32;
  }

  /**
   * @param {{ referent: any; }} other
   */
  matches(other) {
    if (other.referent) {
      return this.referent.matches(other.referent);
    }

    return false;
  }

  /**
   * @param {unknown} _
   */
  bytes(_) {
    return 4;
  }
}
