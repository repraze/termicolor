import {readdirSync, readFileSync} from "node:fs";
import {join} from "node:path";

import {describe, expect, it} from "vitest";

const SRC = join(import.meta.dirname, "..");

function sources(dir: string): string[] {
    return readdirSync(dir, {withFileTypes: true}).flatMap((e) => {
        const path = join(dir, e.name);
        if (e.isDirectory()) {
            return sources(path);
        }
        return /\.tsx$/.test(e.name) ? [path] : [];
    });
}

/**
 * DESIGN.md §4/§6 in code. High contrast swaps neutrals for bright ones; a translucent neutral
 * (`ring-foreground/10`) or a surface shade used as a state (`hover:bg-muted`) silently fades
 * back out. Use the role tokens: `border`, `ring-border`, `bg-hover`, `bg-accent`, `bg-primary`.
 */
describe("components use role tokens for structure and state", () => {
    const files = sources(SRC);

    it.each(files.map((f) => [f.slice(SRC.length + 1), f]))("%s", (_name, file) => {
        const source = readFileSync(file, "utf8");
        const translucentNeutral = source.match(
            /\b(?:ring|border|outline|divide|bg)-(?:foreground|background|border|input|muted)\/\d+/g,
        );
        // the active tab may take the content surface because it also carries an indicator (§7)
        const withoutIndicatedTabs = source.replace(/data-active:bg-card(?=[^"]*data-active:shadow)/g, "");
        const shadeAsState = withoutIndicatedTabs.match(
            /\b(?:hover|focus|aria-expanded|aria-pressed|aria-selected|data-active|data-selected|data-highlighted|data-\[(?:state=on|selected=true)\]):bg-(?:muted|secondary|background|card)\b/g,
        );
        expect({translucentNeutral, shadeAsState}).toEqual({translucentNeutral: null, shadeAsState: null});
    });
});
