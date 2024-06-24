export default class RecordDeclaration {
  /**
   * @param {import("./identifier.js").default[]} names
   * @param {import("./types.ts").Type} type
   */
  constructor(names, type) {
    this.names = names;
    this.type = type;
  }

  /**
   * @param {unknown} e
   */
  bytes(e) {
    return this.type.bytes(e) * this.names.length;
  }

  /**
   * @param {any} e
   */
  generate(e) {
    return `${this.names} = ${this.type.generate(e)}`;
  }
}
