

export default class RecordType {
  /**
   * @param {any} fields
   * @param {boolean} [packed]
   */
  constructor(fields, packed) {
    this.fields = fields;
    this.packed = packed;
  }

  /**
   * @param {any} e
   */
  bytes(e) {
    return this.fields
      .map( function(/** @type {{ bytes: (arg0: any) => any; }} */ f) { return f.bytes(e); } )
      .reduce(function(/** @type {any} */ a, /** @type {any} */ b) { return a + b; }, 0);
  }

  /**
   * @param {any} other
   */
  matches(other) {
    return true;
  }

  /**
   * @param {any} e
   */
  initializer(e) {
    return "{}";
  }

  /**
   * @param {any} e
   */
  generate(e) {
    return `record(${this.fields.map( function(/** @type {{ generate: (arg0: any) => any; }} */ t) { if (Array.isArray(t)) return "???"; else return t.generate(e); } ).join(',')})`;
  }

};
