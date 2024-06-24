import Environment from "./environment.js";

export default class FileType {
  /**
   * @param {any} type
   * @param {boolean} packed
   */
  constructor(type, packed) {
    this.fileType = true;
    this.type = type;
  }

  /**
   * @param {unknown} [_]
   */
  binaryen(_) {
    throw "Cannot pass file by value";
  }

  /**
   * @param {{ fileType: any; type: any; }} other
   */
  matches(other) {
    if (other.fileType) {
      return this.type.matches(other.type);
    }

    return false;
  }

  isInteger() {
    return false;
  }

  /**
   * @param {any} e
   * @returns {number}
   */
  bytes(e) {
    return 4 + this.type.bytes(e);
  }

  /**
   * @param {unknown} _
   */
  initializer(_) {
    return `new FileHandle()`;
  }

  /**
   * @param {Environment} e
   */
  generate(e) {
    return `file of type ${this.type.generate(e)}`;
  }
}
