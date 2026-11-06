import {contrast, palette, solid} from "@termicolor/palette";

import {expect, test, THEMES, useTheme} from "./fixtures";

/** rgb()/rgba() → #rrggbb[aa] */
function hex(css: string): string {
    const [r, g, b, a] = css.match(/[\d.]+/g)!.map(Number);
    const h = [r, g, b].map((v) => Math.round(v!).toString(16).padStart(2, "0")).join("");
    return a === undefined || a === 1
        ? `#${h}`
        : `#${h}${Math.round(a * 255)
              .toString(16)
              .padStart(2, "0")}`;
}

/** DESIGN.md §6 checked in the browser, in every mode: hover is visible, popups get the mode's border. */
for (const theme of THEMES) {
    const mode = theme.contrast ? palette.highContrast[theme.scheme] : palette.modes[theme.scheme];
    const r = mode.roles;

    test(`hover is visible ${theme.name}`, async ({page}) => {
        await useTheme(page, theme);
        await page.goto("ports");
        const outline = page.getByRole("button", {name: "Available", exact: true});
        const pageBg = hex(await page.evaluate(() => getComputedStyle(document.body).backgroundColor));
        await outline.hover();
        await expect
            .poll(async () =>
                contrast(
                    solid(hex(await outline.evaluate((el) => getComputedStyle(el).backgroundColor)), pageBg),
                    pageBg,
                ),
            )
            .toBeGreaterThanOrEqual(theme.contrast ? 1.5 : 1.05);
    });

    test(`menu popup has the mode's border and a visible highlight ${theme.name}`, async ({page}) => {
        await useTheme(page, theme);
        await page.goto("");
        await page.getByTestId("theme-menu").click();
        const popup = page.locator('[data-slot="dropdown-menu-content"]');
        await expect(popup).toBeVisible();
        const shadow = await popup.evaluate((el) => getComputedStyle(el).boxShadow);
        const ring = shadow.match(/rgba?\([^)]*\)/g)?.map(hex) ?? [];
        expect(ring).toContain(r.border);
        const item = popup.getByRole("menuitemradio", {name: "Dark"});
        await item.hover();
        await expect
            .poll(async () => hex(await item.evaluate((el) => getComputedStyle(el).backgroundColor)))
            .toBe(r.accentTint);
    });
}
