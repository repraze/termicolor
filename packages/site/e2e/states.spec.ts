import {contrast, palette} from "@termicolor/palette";

import {SITE_ACCENT} from "../src/lib/site";
import {expect, test, THEMES, useTheme} from "./fixtures";

/** CSS rgb()/rgba() → #rrggbb (alpha ignored: only opaque fills are compared). */
function hex(css: string): string {
    const [r, g, b] = css.match(/[\d.]+/g)!.map(Number);
    return `#${[r, g, b].map((v) => Math.round(v!).toString(16).padStart(2, "0")).join("")}`;
}

/**
 * DESIGN.md §3/§5: state is never shown by surface shade alone. These caught the high contrast
 * bugs where a pressed filter and the search input were invisible or grey.
 */
for (const theme of THEMES) {
    const mode = theme.contrast ? palette.highContrast[theme.scheme] : palette.modes[theme.scheme];

    test(`selected filter stands out ${theme.name}`, async ({page}) => {
        await useTheme(page, theme);
        await page.goto("ports");
        const pressed = page.getByRole("button", {name: "All", pressed: true}).first();
        await expect(pressed).toBeVisible();
        const bg = hex(await pressed.evaluate((el) => getComputedStyle(el).backgroundColor));
        const page_ = hex(await page.evaluate(() => getComputedStyle(document.body).backgroundColor));
        expect(contrast(bg, page_)).toBeGreaterThanOrEqual(3);
    });

    test(`search input sits on bgRaised ${theme.name}`, async ({page}) => {
        await useTheme(page, theme);
        await page.goto("ports");
        const input = page.getByRole("textbox").first();
        expect(hex(await input.evaluate((el) => getComputedStyle(el).backgroundColor))).toBe(mode.roles.bgRaised);
        expect(hex(await input.evaluate((el) => getComputedStyle(el).borderTopColor))).toBe(mode.roles.borderStrong);
    });
}

/** The accent is part of the theme: default red, and `.accent-<name>` switches every accent role. */
for (const theme of THEMES) {
    const mode = theme.contrast ? palette.highContrast[theme.scheme] : palette.modes[theme.scheme];
    for (const accent of [undefined, "pink", "purple"] as const) {
        test(`accent ${accent ?? "default"} drives primary ${theme.name}`, async ({page}) => {
            await useTheme(page, theme, accent);
            await page.goto("");
            const button = page.getByText(/Browse \d+ ports/);
            const expected = mode.accentRoles[accent ?? SITE_ACCENT].accent;
            expect(hex(await button.evaluate((el) => getComputedStyle(el).backgroundColor))).toBe(expected);
            // nested mode previews follow the page accent too
            const nested = page.locator('[data-mode="light"]');
            const nestedAccent = await nested.evaluate((el) =>
                getComputedStyle(el).getPropertyValue("--tc-accent").trim(),
            );
            expect(nestedAccent).toBe(palette.modes.light.accentRoles[accent ?? SITE_ACCENT].accent);
        });
    }
}
