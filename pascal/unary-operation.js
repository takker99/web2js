import Binaryen from "../deps/binaryen.ts";

export default class UnaryOperation {
  /**
   * @param {"+"|"-"|"!"} operator
   * @param {any} operand
   */
  constructor(operator, operand) {
    this.operator = operator;
    this.operand = operand;
  }

  generate(environment) {
    var module = environment.module;
    var a = this.operand.generate(environment);

    this.type = environment.resolveType(this.operand.type);

    if (this.operator == "+") {
      return a;
    }

    if (this.type.isInteger()) {
      return module.i32.mul(module.i32.const(-1), a);
    }

    if (this.type.name == "real") {
      return module.f32.neg(a);
    }

    if (this.operator === "!") {
      if (this.type.name == "boolean") {
        return module.i32.eq(a, module.i32.const(0));
      }
    }

    throw "Unknown unary operator " + this.operator;
    return module.nop();
  }
}
