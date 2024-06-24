import { ok } from "https://raw.githubusercontent.com/wavebeem/bread-n-butter/v0.6.0/src/bread-n-butter.ts";
import { comma, eos, identifier, lParen, rParen, token } from "./token.ts";

const programFiles = identifier.sepBy(comma, 1).wrap(lParen, rParen);
export const programHeading = token("program").next(identifier).and(programFiles.or(ok([] as string[]))).skip(eos);
