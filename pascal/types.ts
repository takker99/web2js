import ArrayType from "./array-type.js";
import Desig from "./desig.js";
import ExpressionWithWidth from "./expression-with-width.js";
import FileType from "./file-type.js";
import FunctionEvaluation from "./function-evaluation.js";
import Identifier from "./identifier.js";
import NumericLiteral from "./numeric-literal.js";
import Operation from "./operation.js";
import PointerType from "./pointer-type.js";
import Pointer from "./pointer.js";
import RecordType from "./record-type.js";
import SingleCharacter from "./single-character.js";
import StringLiteral from "./string-literal.js";
import SubrangeType from "./subrange-type.js";
import UnaryOperation from "./unary-operation.js";

export type Type =
  | PointerType
  | ArrayType
  | RecordType
  | SubrangeType
  | Identifier
  | FileType;

export type Express =
  | UnaryOperation
  | Operation
  | Variable
  | Constant
  | FunctionEvaluation;

export type Variable = Identifier | Desig | Pointer;
export type Constant = NumericLiteral | StringLiteral | SingleCharacter;

export type ActualParam = Express | ExpressionWithWidth;

export type SubrangeConstant = NumericLiteral | UnaryOperation | Identifier;
