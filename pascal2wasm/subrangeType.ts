import { identifier, integer, token } from "./token.ts";

const subrangeConstant = integer.or(identifier);
export const subrangeType = subrangeConstant.skip(
    token(".."),
).and(
    subrangeConstant,
).desc(["subrange type"]);
