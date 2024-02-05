

import ArrayType from './array-type.js';
import RecordDeclaration from './record-declaration.js';
import VariantDeclaration from './variant-declaration.js';
import RecordType from './record-type.js';
import FileType from './file-type.js';
import Binaryen from 'binaryen';
import UnaryOperation from './unary-operation.js';
import Constant from './constant.js';
import Identifier from './identifier.js';
import Program from './program.js';
const { Module } = Binaryen;

export default class Environment {
  /**
   * @param {Environment} parent
   * @param {string} [name]
   */
  constructor(parent, name) {
    this.parent = parent;
    if (parent) {
      this.functionIdentifier = parent.functionIdentifier;
      /** @type {Program|undefined} */
      this.program = parent.program;
    }

    this.name = name;
    this.labels = {};
    /** @type {Record<string,number>} */
    this.constants = {};
    this.variables = {};
    this.types = {};
    this.functions = {};

    this.setVariable = {};
    this.getVariable = {};

    if (parent)
      /** @type{Binaryen.Module} */
      this.module = parent.module;
    else
      this.module = new Module();
  }

  /**
   * @param {string | number} label
   */
  resolveLabel(label) {
    var e = this;

    while (e) {
      if (e.labels[label])
        return e.labels[label];

      e = e.parent;
    }

    return undefined;
  }

  /**
   * @param {{ name: string | number; }} typeIdentifier
   */
  resolveTypeOnce(typeIdentifier) {
    var e = this;

    while (e) {
      if (e.types[typeIdentifier.name])
        return e.types[typeIdentifier.name];

      e = e.parent;
    }

    return typeIdentifier;
  }

  /**
   * @param {{ type: any; names: any; variants: any[]; }} f
   */
  resolveRecordDeclaration(f) {
    var self = this;
    if (f.type) {
      var t = self.resolveType(f.type);
      return new RecordDeclaration(f.names, t);
    }

    if (f.variants) {
      return new VariantDeclaration(f.variants.map(function (/** @type {any} */ v) {
        return self.resolveType(v);
      }));
    }

    throw `Could not resolve record declaration ${f}`;
  }

  /**
   * @param {any} typeIdentifier
   */
  resolveType(typeIdentifier) {
    var old = undefined;
    var resolved = typeIdentifier;
    var self = this;

    do {
      old = resolved;
      resolved = self.resolveTypeOnce(resolved);
    } while (old != resolved);

    if (resolved.fileType) {
      return new FileType(self.resolveType(resolved.type), resolved.packed);
    }

    if (resolved.lower) {
      if ((resolved.lower.name) || (resolved.lower.operator)) {
        resolved.lower = this.resolveConstant(resolved.lower);
      }
    }

    if (resolved.upper) {
      if ((resolved.upper.name) || (resolved.upper.operator)) {
        resolved.upper = this.resolveConstant(resolved.upper);
      }
    }

    if (resolved.componentType) {
      var component = self.resolveType(resolved.componentType);
      var index = self.resolveType(resolved.index);
      return new ArrayType(index, component);
    }

    if (resolved.fields) {
      return new RecordType(
        resolved.fields.map(function (/** @type {any} */ f) {
          return self.resolveRecordDeclaration(f);
        }),
        resolved.packed);
    }

    return resolved;
  }

  /**
   * @param {UnaryOperation|Constant|Identifier} c
   * @return {UnaryOperation|Constant|Identifier|undefined}
   */
  resolveConstant(c) {
    var e = this;

    if (c.operator == '-') {
      c = this.resolveConstant(c.operand);
      c = Object.assign({}, c)
      c.number = c.number * -1;
      return c;
    }

    while (e) {
      if (e.constants[c.name])
        return e.constants[c.name];

      e = e.parent;
    }

    return undefined;
  }

  /**
   * @param {{ name: string | number; }} c
   */
  resolveFunction(c) {
    var e = this;

    while (e) {
      if (e.functions[c.name])
        return e.functions[c.name];

      e = e.parent;
    }

    return undefined;
  }

  /**
   * @param {{ name: string | number; }} variableIdentifier
   */
  resolveVariable(variableIdentifier) {
    var e = this;

    while (e) {
      if (e.variables[variableIdentifier.name])
        return e.variables[variableIdentifier.name];

      e = e.parent;
    }

    return undefined;
  }

};
