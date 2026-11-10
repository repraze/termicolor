import {contrast, palette, solid} from "@repraze/termicolor";

import {SITE_ACCENT} from "../src/lib/site";
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
            .toBeGreaterThanOrEqual(theme.contrast ? 1.35 : 1.05);
    });

    test(`theme menu popup has the mode's border and visible item states ${theme.name}`, async ({page}) => {
        await useTheme(page, theme);
        await page.goto("");
        await page.getByTestId("theme-menu").click();
        const popup = page.locator('[data-slot="theme-menu-content"]');
        await expect(popup).toBeVisible();
        // the outline is a real border (kernelkit popupSurface), in the mode's border role
        expect(hex(await popup.evaluate((el) => getComputedStyle(el).borderTopColor))).toBe(r.border);
        // the current mode is a pressed toggle, on the accent tint
        const modes = popup.getByRole("group", {name: "Mode"});
        const current = modes.getByRole("button", {name: theme.scheme === "dark" ? "Dark" : "Light"});
        await expect(current).toHaveAttribute("aria-pressed", "true");
        expect(hex(await current.evaluate((el) => getComputedStyle(el).backgroundColor))).toBe(
            mode.accentRoles[SITE_ACCENT].accentTint,
        );
        // another mode shows a hover wash it doesn't have at rest
        const other = modes.getByRole("button", {name: "System"});
        const rest = await other.evaluate((el) => getComputedStyle(el).backgroundColor);
        await other.hover();
        await expect.poll(async () => other.evaluate((el) => getComputedStyle(el).backgroundColor)).not.toBe(rest);
    });
}

/** DESIGN.md §6 "Clickable surfaces": hover shows an accent border and an accent title. */
for (const theme of THEMES) {
    const mode = theme.contrast ? palette.highContrast[theme.scheme] : palette.modes[theme.scheme];
    test(`clickable cards and rows react to hover ${theme.name}`, async ({page}) => {
        await useTheme(page, theme);
        await page.goto("ports/wallpapers");
        const card = page.getByTestId("wallpaper-card").first();
        await card.getByRole("button", {name: /^Preview/}).hover();
        await expect
            .poll(async () => hex(await card.evaluate((el) => getComputedStyle(el).borderTopColor)))
            .toBe(mode.accentRoles[SITE_ACCENT].accent);
        await expect(card.getByText("preview", {exact: true})).toBeVisible();

        await page.goto("ports");
        const row = page
            .locator("section")
            .getByRole("link", {name: /^Alacritty/})
            .first();
        await row.hover();
        const name = row.getByText("Alacritty", {exact: true});
        await expect
            .poll(async () => hex(await name.evaluate((el) => getComputedStyle(el).color)))
            .toBe(mode.accentRoles[SITE_ACCENT].accent);
        // rows show an accent side bar; their divider keeps the border color (it used to turn accent too)
        await expect.poll(async () => row.evaluate((el) => getComputedStyle(el, "::before").scale)).toMatch(/^1( 1)?$/);
        expect(hex(await row.evaluate((el) => getComputedStyle(el, "::before").backgroundColor))).toBe(
            mode.accentRoles[SITE_ACCENT].accent,
        );
        expect(hex(await row.evaluate((el) => getComputedStyle(el).borderBottomColor))).toBe(mode.roles.border);
        expect(hex(await row.evaluate((el) => getComputedStyle(el).borderLeftColor))).not.toBe(
            mode.accentRoles[SITE_ACCENT].accent,
        );
    });
}
