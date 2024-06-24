import { match } from "https://raw.githubusercontent.com/wavebeem/bread-n-butter/v0.6.0/src/bread-n-butter.ts";

const whitespace = match(/\s*/m).desc([]);
const comment = match(/\{[^{]*\}/).trim(whitespace).desc([]);
/** token separator */
export const separator = comment.repeat(1).or(whitespace).desc(["separator"]);
