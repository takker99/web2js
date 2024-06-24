import { comma, identifier, lParen, rParen } from "./token.ts";

export const enumeratedType = identifier.sepBy(comma, 1).wrap(lParen, rParen)
    .desc(["enumerated type"]);
