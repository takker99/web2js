import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { enumeratedType } from "./enumeratedType.ts";

Deno.test("enumeratedType", async (t) => {
  await t.step("empty input is invalid", () => {
    assertEquals(enumeratedType.parse("()"), {
      type: "ParseFail",
      expected: ["enumerated type"],
      location: { column: 2, index: 1, line: 1 },
    });
  });

  await t.step("single identifier", () => {
    assertEquals(enumeratedType.parse("(x)"), {
      type: "ParseOK",
      value: ["x"],
    });
  });

  await t.step("multiple identifiers", () => {
    assertEquals(enumeratedType.parse("(x, y, z)"), {
      type: "ParseOK",
      value: ["x", "y", "z"],
    });
  });

  await t.step("invalid input", () => {
    assertEquals(enumeratedType.parse("(x, y, z"), {
      type: "ParseFail",
      expected: ["enumerated type"],
      location: { column: 9, index: 8, line: 1 },
    });
  });
});