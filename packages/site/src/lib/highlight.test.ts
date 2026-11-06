import {describe, expect, it} from "vitest";

import {cssVarTheme, highlight, langFor} from "./highlight";

describe("langFor", () => {
    it("maps port files and fence tags", () => {
        expect(langFor("termicolor-dark.toml")).toBe("toml");
        expect(langFor("colors/termicolor-dark.toml")).toBe("toml");
        expect(langFor("termicolor-dark.itermcolors")).toBe("xml");
        expect(langFor("termicolor-dark.tmTheme")).toBe("xml");
        expect(langFor("termicolor-dark")).toBe("ini");
        expect(langFor("fzf-dark.ps1")).toBe("powershell");
        expect(langFor("bash")).toBe("shellscript");
        expect(langFor("notes.dircolors")).toBe("text");
    });
});

describe("css variable theme", () => {
    it("gives every placeholder a variable and nothing else", () => {
        const {replacements} = cssVarTheme();
        const values = Object.values(replacements);
        expect(values).toContain("var(--tc-purple)");
        expect(values).toContain("var(--tc-fg-soft)");
        expect(new Set(Object.keys(replacements)).size).toBe(values.length);
    });

    it("highlights with variables, never raw palette hex", async () => {
        const html = await highlight('const answer = "42"; // hi', "tsx");
        expect(html).toContain("var(--tc-");
        expect(html).not.toMatch(/color:#[0-9a-f]{6}\b/i);
    });
});
