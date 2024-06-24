import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { separator } from "./separator.ts";

Deno.test("separator", async (t) => {
  await t.step("whitespaces", () => {
    assertEquals(separator.parse(""), { type: "ParseOK", value: "" });
    assertEquals(separator.parse(" "), { type: "ParseOK", value: " " });
    assertEquals(separator.parse("   "), { type: "ParseOK", value: "   " });
  });
  await t.step("comment", () => {
    assertEquals(separator.parse("{ This is a comment }"), { type: "ParseOK", value: ["{ This is a comment }"] });
    assertEquals(separator.parse("{Comment 1}{ Comment 2 }"), {
      type: "ParseOK",
      value: ["{Comment 1}", "{ Comment 2 }"],
    });
  });
  await t.step("whitespace and comment", () => {
    assertEquals(separator.parse(" { Comment } "), { type: "ParseOK", value: ["{ Comment }"] });
  });
});
