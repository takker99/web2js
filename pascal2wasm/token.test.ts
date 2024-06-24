import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { character, integer, literal, real } from "./token.ts";

Deno.test("integer", async (t) => {
  await t.step("positive integer", () => {
    assertEquals(integer.parse("123"), { type: "ParseOK", value: 123 });
  });
  await t.step("positive integer with plus sign", () => {
    assertEquals(integer.parse("+789"), { type: "ParseOK", value: 789 });
  });
  await t.step("negative integer", () => {
    assertEquals(integer.parse("-456"), { type: "ParseOK", value: -456 });
  });
  await t.step("zero", () => {
    assertEquals(integer.parse("0"), { type: "ParseOK", value: 0 });
  });
  await t.step("invalid input", () => {
    assertEquals(integer.parse("abc"), {
      type: "ParseFail",
      expected: ["integer"],
      location: { column: 1, index: 0, line: 1 },
    });
  });
});
Deno.test("real", async (t) => {
  await t.step("positive real number", () => {
    assertEquals(real.parse("3.14"), { type: "ParseOK", value: 3.14 });
  });
  await t.step("negative real number", () => {
    assertEquals(real.parse("-2.5"), { type: "ParseOK", value: -2.5 });
  });
  await t.step("real number with exponent", () => {
    assertEquals(real.parse("1.23e+4"), { type: "ParseOK", value: 12300 });
  });
  await t.step("real number with negative exponent", () => {
    assertEquals(real.parse("5.67e-3"), { type: "ParseOK", value: 0.00567 });
  });
  await t.step("invalid input", () => {
    assertEquals(real.parse("abc"), {
      type: "ParseFail",
      expected: ["real"],
      location: { column: 1, index: 0, line: 1 },
    });
  });
});
Deno.test("character", async (t) => {
  await t.step("single character", () => {
    assertEquals(character.parse("'a'"), { type: "ParseOK", value: "a" });
  });
  await t.step("empty character", () => {
    assertEquals(character.parse("''"), { type: "ParseOK", value: "" });
  });
  await t.step("invalid input", () => {
    assertEquals(character.parse("'ab'"), {
      type: "ParseFail",
      expected: ["'"],
      location: { column: 3, index: 2, line: 1 },
    });
  });
});
Deno.test("literal", async (t) => {
  await t.step("non-empty literal", () => {
    assertEquals(literal.parse("'Hello, World!'"), { type: "ParseOK", value: "Hello, World!" });
  });
  await t.step("empty literal", () => {
    assertEquals(literal.parse("''"), { type: "ParseOK", value: "" });
  });
  await t.step("invalid input", () => {
    assertEquals(literal.parse("'Hello"), {
      type: "ParseFail",
      expected: ["literal"],
      location: { column: 7, index: 6, line: 1 },
    });
  });
});
