import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { labelDeclarationPart ,label} from "./labelDeclarationPart.ts";

Deno.test("label", async (t) => {
  await t.step("valid label", () => {
    assertEquals(label.parse("123"), { type: "ParseOK", value: 123 });
    assertEquals(label.parse("  9999  "), { type: "ParseOK", value: 9999 });
    assertEquals(label.parse("123{* comment *}"), { type: "ParseOK", value: 123 });
    assertEquals(label.parse("0"), { type: "ParseOK", value: 0 });
    assertEquals(label.parse("9999"), { type: "ParseOK", value: 9999 });
  });

  await t.step("invalid label", () => {
    assertEquals(label.parse("abc"), {
      type: "ParseFail",
      expected: ["label"],
      location: { column: 1, index: 0, line: 1 },
    });
    assertEquals(label.parse("123abc"), {
      type: "ParseFail",
      expected: ["<EOF>"],
      location: { column: 4, index: 3, line: 1 },
    });
    assertEquals(label.parse("10000"), {
      type: "ParseFail",
      expected: ["<EOF>"],
      location: { column: 5, index: 4, line: 1 },
    });
  });
});
Deno.test("labelDeclarationPart", async (t) => {
  await t.step("empty input", () => {
    assertEquals(labelDeclarationPart.parse(""), { type: "ParseOK", value: [] });
  });
  await t.step("single input", () => {
    assertEquals(labelDeclarationPart.parse("label 123;"), { type: "ParseOK", value: [123] });
    assertEquals(
      labelDeclarationPart.parse(`label
    123;`),
      { type: "ParseOK", value: [123] },
    );
  });
  await t.step("empty input", () => {
    assertEquals(labelDeclarationPart.parse("label 123, 456, 789,0;"), { type: "ParseOK", value: [123, 456, 789,0] });
    assertEquals(
      labelDeclarationPart.parse(`label
    123,
    456,
    789;`),
      { type: "ParseOK", value: [123, 456, 789] },
    );
  });
  await t.step("invalid input", () => {
    assertEquals(labelDeclarationPart.parse("label 123, abc, 789;"), {
      type: "ParseFail",
      expected: ["label"],
      location: { column: 12, index: 11, line: 1 },
    });
  });
});