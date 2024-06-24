import { assertEquals } from "../deps/assert.ts";
import { subrangeType } from "./subrangeType.ts";

Deno.test("subrangeType", async (t) => {
    await t.step("integer range", () => {
        assertEquals(subrangeType.parse("1..10"), {
            type: "ParseOK",
            value: [1, 10],
        });
    });

    await t.step("identifier range", () => {
        assertEquals(subrangeType.parse("a..z"), {
            type: "ParseOK",
            value: ["a", "z"],
        });
    });

    await t.step("constant range", () => {
        assertEquals(subrangeType.parse("1..x"), {
            type: "ParseOK",
            value: [1, "x"],
        });
    });

    await t.step("negative constant range", () => {
        assertEquals(subrangeType.parse("-10..-1"), {
            type: "ParseOK",
            value: [-10, -1],
        });
    });

    await t.step("negative identifier range", () => {
        assertEquals(subrangeType.parse("-7..y"), {
            type: "ParseOK",
            value: [-7, "y"],
        });
        assertEquals(subrangeType.parse("-x..-y"), {
            type: "ParseFail",
            expected: ["subrange type"],
            location: { column: 1, index: 0, line: 1 },
        });
        assertEquals(subrangeType.parse("-9..-y"), {
            type: "ParseFail",
            expected: ["subrange type"],
            location: { column: 5, index: 4, line: 1 },
        });
    });
    await t.step("two periods must be required", () => {
        assertEquals(subrangeType.parse("10.-1"), {
            type: "ParseFail",
            expected: ["subrange type"],
            location: { column: 3, index: 2, line: 1 },
        });
    });
});
