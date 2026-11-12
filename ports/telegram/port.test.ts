import {allModes, palette} from "@repraze/termicolor";
import {describe, expect, it} from "vitest";

import {KEYS} from "./keys.ts";
import port, {sections} from "./port.ts";

const HEX = /^#[0-9a-f]{6}([0-9a-f]{2})?$/i;

describe.each(allModes())("telegram palette ($id)", (mode) => {
    const entries = sections(mode, palette.modes).flatMap(([, list]) => list);
    const keys = entries.map(([key]) => key);

    it("sets every Telegram key exactly once, and nothing else", () => {
        expect(new Set(keys).size).toBe(keys.length);
        expect([...keys].sort()).toEqual([...KEYS].sort());
    });

    it("uses hex colors or keys set earlier in the file", () => {
        const seen = new Set<string>();
        for (const [key, value] of entries) {
            if (!HEX.test(value)) {
                expect(seen.has(value), `${key}: ${value}`).toBe(true);
            }
            seen.add(key);
        }
    });
});

describe("telegram files", () => {
    const files = port.build(palette);

    it("ships a dark and a light palette", () => {
        expect(files.map((f) => f.path)).toEqual([
            "termicolor-dark.tdesktop-palette",
            "termicolor-light.tdesktop-palette",
        ]);
    });

    it("writes one `key: value;` line per key", () => {
        for (const {contents} of files) {
            const lines = contents.split("\n").filter((line) => line && !line.startsWith("//"));
            expect(lines).toHaveLength(KEYS.length);
            for (const line of lines) {
                expect(line).toMatch(/^[A-Za-z0-9_]+: #?[A-Za-z0-9_]+;$/);
            }
        }
    });
});
