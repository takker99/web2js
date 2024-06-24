import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { constDeclarationPart } from "./constDeclarationPart.ts";

Deno.test("constDeclarationPart", async (t) => {
  await t.step("empty input", () => {
    assertEquals(constDeclarationPart.parse(""), { type: "ParseOK", value: [] });
  });
  await t.step("single input", () => {
    assertEquals(constDeclarationPart.parse("const x = 123;"), {
      type: "ParseOK",
      value: [{ type: "constant", name: "x", value: 123 }],
    });
  });
  await t.step("multiple inputs", () => {
    assertEquals(constDeclarationPart.parse("const x = 123; y = 'hello world';"), {
      type: "ParseOK",
      value: [
        { type: "constant", name: "x", value: 123 },
        { type: "constant", name: "y", value: "hello world" },
      ],
    });
    assertEquals(
      constDeclarationPart.parse(`const
    x = 123;
    y = 'hello world';
    z = aaa;`),
      {
        type: "ParseOK",
        value: [
          { type: "constant", name: "x", value: 123 },
          { type: "constant", name: "y", value: "hello world" },
          { type: "constant", name: "z", value: "aaa" },
        ],
      },
    );
  });
  await t.step("invalid input", () => {
    assertEquals(constDeclarationPart.parse("const x = ##;"), {
      type: "ParseFail",
      expected: ["constant"],
      location: { column: 11, index: 10, line: 1 },
    });
  });
});
