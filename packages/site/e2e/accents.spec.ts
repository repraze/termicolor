import {type Page} from "@playwright/test";
import {DEFAULT_ACCENT, palette} from "@termicolor/palette";

import {SITE_ACCENT} from "../src/lib/site";
import {expect, test, useTheme} from "./fixtures";

const cursorLine = (hex: string) => new RegExp(`cursor\\s+${hex}`, "i");
const picked = (page: Page) => page.getByRole("group", {name: "Accent"}).locator("[aria-pressed=true]");

test("port files default to the ports' accent, not the site's, and can be rebuilt for any accent", async ({page}) => {
    await useTheme(page, {name: "dark", scheme: "dark", contrast: false});
    await page.goto("ports/kitty");
    const code = page.getByTestId("port-files").locator(".shiki");
    expect(SITE_ACCENT).not.toBe(DEFAULT_ACCENT);
    await expect(code).toContainText(cursorLine(palette.modes.dark.accentRoles[DEFAULT_ACCENT].cursor));
    await expect(picked(page)).toHaveAccessibleName(DEFAULT_ACCENT);

    await page.getByRole("group", {name: "Accent"}).getByRole("button", {name: "pink"}).click();
    await expect(code).toContainText(cursorLine(palette.modes.dark.accentRoles.pink.cursor));
    // the site keeps its own accent
    await expect(page.locator("html")).toHaveClass(new RegExp(`accent-${SITE_ACCENT}`));

    const [download] = await Promise.all([
        page.waitForEvent("download"),
        page.getByRole("button", {name: "Download"}).click(),
    ]);
    expect(download.suggestedFilename()).toBe("termicolor-dark.conf");
    const text = await (await import("node:fs/promises")).readFile((await download.path())!, "utf8");
    expect(text).toMatch(cursorLine(palette.modes.dark.accentRoles.pink.cursor));
});

test("ports that don't use the accent don't offer a picker", async ({page}) => {
    await page.goto("ports/dircolors");
    await expect(page.getByTestId("port-files").locator(".shiki")).toBeVisible();
    await expect(page.getByRole("group", {name: "Accent"})).toHaveCount(0);
});

test("the picked accent sticks across ports, reloads and tabs", async ({page, context}) => {
    await page.goto("ports/kitty");
    await page.getByRole("group", {name: "Accent"}).getByRole("button", {name: "green"}).click();
    await expect(page).not.toHaveURL(/accent=/);

    await page.goto("ports/alacritty");
    await expect(picked(page)).toHaveAccessibleName("green");
    await page.reload();
    await expect(picked(page)).toHaveAccessibleName("green");

    const other = await context.newPage();
    await other.goto("ports/kitty");
    await expect(picked(other)).toHaveAccessibleName("green");
    await page.getByRole("group", {name: "Accent"}).getByRole("button", {name: "blue"}).click();
    await expect(picked(other)).toHaveAccessibleName("blue");
});

test("a shared ?accent= link wins until you pick", async ({page}) => {
    await page.goto("ports/kitty?accent=orange");
    await expect(picked(page)).toHaveAccessibleName("orange");
    await page.getByRole("group", {name: "Accent"}).getByRole("button", {name: "cyan"}).click();
    await expect(page).not.toHaveURL(/accent=/);
    await expect(picked(page)).toHaveAccessibleName("cyan");
});
