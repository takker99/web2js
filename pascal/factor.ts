import FunctionEvaluation from "./function-evaluation.js";
import { ConstantType } from "./literal.ts";
import { VariableType } from "./variable.ts";

export type Factor = VariableType | ConstantType | FunctionEvaluation;
