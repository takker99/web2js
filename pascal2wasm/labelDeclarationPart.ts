import { match, ok } from "https://raw.githubusercontent.com/wavebeem/bread-n-butter/v0.6.0/src/bread-n-butter.ts";
import { separator } from "./separator.ts";
import { comma, eos, token } from "./token.ts";

export const label = match(/(0|[1-9]\d{0,3})/).map(Number).trim(separator).desc(["label"]);
export const labelDeclarationPart = label.sepBy(comma, 1).wrap(
  token("label"),
  eos,
).or(ok([] as number[]));
