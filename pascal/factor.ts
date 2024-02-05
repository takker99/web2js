import FunctionEvaluation from "./function-evaluation.js";
import { ConstantType } from "./literal.js";
import { VariableType } from "./variable.js";

export type Factor = VariableType|ConstantType|FunctionEvaluation