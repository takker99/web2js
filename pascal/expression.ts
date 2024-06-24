import { Factor } from "./factor.ts";
import Operation from "./operation.js";
import UnaryOperation from "./unary-operation.js";

export type Expression = UnaryOperation | Operation | Factor;
