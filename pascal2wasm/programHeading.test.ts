import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { programHeading } from "./programHeading.ts";

Deno.test("programHeading", () => {
  assertEquals(programHeading.parse("program myProgram;"), { type: "ParseOK", value: ["myProgram", []] });
  assertEquals(programHeading.parse("program myProgram(file1, file2);"), {
    type: "ParseOK",
    value: ["myProgram", ["file1", "file2"]],
  });

  assertEquals(programHeading.parse("program myProgram  ();"), {
    type: "ParseFail",
    expected: ["identifier"],
    location: { column: 21, index: 20, line: 1 },
  });
  assertEquals(programHeading.parse("program myProgram"), {
    type: "ParseFail",
    expected: ["(", ";"],
    location: { column: 18, index: 17, line: 1 },
  });
  assertEquals(programHeading.parse("program;"), {
    type: "ParseFail",
    expected: ["identifier"],
    location: { column: 8, index: 7, line: 1 },
  });
});
