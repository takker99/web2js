import { ok } from "https://raw.githubusercontent.com/wavebeem/bread-n-butter/v0.6.0/src/bread-n-butter.ts";
import { constant, eos, identifier, token } from "./token.ts";

const constDeclaration = identifier.skip(token("=")).and(constant);
export const constDeclarationPart = token("const").next(constDeclaration.sepBy(eos, 1).skip(eos)).or(
  ok([] as [string, string | number][]),
).map((parsed) => parsed.map(([name, value]) => ({ type: "constant", name, value })));
