import type {Page} from "@playwright/test";

import {expect, test, THEMES, useTheme} from "./fixtures";

/** Keys only work once the app has mounted its hotkeys: wait for the header's search button. */
async function press(page: Page, key: string) {
    await expect(page.getByRole("button", {name: /Search/}).first()).toBeVisible();
    await page.keyboard.press(key);
    // opening focuses the input, so typing goes straight to the query
    await expect(page.getByRole("dialog", {name: "Search"}).getByRole("combobox")).toBeFocused();
}

test("header search finds a port by its contents and opens it", async ({page}) => {
    await page.goto("");
    await page
        .getByRole("button", {name: /Search/})
        .first()
        .click();
    const dialog = page.getByRole("dialog", {name: "Search"});
    await dialog.getByRole("combobox").fill("gsettings");
    await expect(dialog.getByRole("option", {name: /GNOME Terminal/})).toBeVisible();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/ports\/gnome-terminal$/);
    await expect(dialog).toBeHidden();
});

test("keyboard: / and mod+K open search, arrows move, typos still match", async ({page}) => {
    await page.goto("palette");
    await press(page, "/");
    const dialog = page.getByRole("dialog", {name: "Search"});
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();

    await press(page, "ControlOrMeta+k");
    await page.keyboard.type("alacrity");
    await expect(dialog.getByRole("option").first()).toContainText("Alacritty");
    await expect(dialog.getByRole("option").first()).toHaveAttribute("aria-selected", "true");
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/ports\/alacritty$/);
});

test("search links into filtered pages and anchors", async ({page}) => {
    await page.goto("");
    await press(page, "/");
    await page.keyboard.type("light high contrast");
    await page.getByRole("option", {name: /Light high contrast mode/}).click();
    await expect(page).toHaveURL(/palette#light-hc$/);
    await expect(page.locator("#light-hc")).toBeInViewport();

    await press(page, "/");
    await page.keyboard.type("gradients");
    await page.getByRole("option", {name: /Gradients wallpapers/}).click();
    await expect(page).toHaveURL(/ports\/wallpapers\?family=gradients/);
});

test("the ports filter keeps its own input and doesn't steal /", async ({page}) => {
    await page.goto("ports");
    await page.getByRole("textbox", {name: "Filter ports"}).fill("kitty");
    await expect(page).toHaveURL(/q=kitty/);
    await page.keyboard.press("Escape");
    await page.locator("h1").click();
    await press(page, "/");
});

/** The highlighted result is a selected row (DESIGN.md §6), visible in every mode. */
for (const theme of THEMES) {
    test(`search results highlight ${theme.name}`, async ({page}) => {
        await useTheme(page, theme);
        await page.goto("");
        await press(page, "/");
        await page.keyboard.type("term");
        const dialog = page.getByRole("dialog", {name: "Search"});
        await expect(dialog.getByRole("option").first()).toHaveAttribute("aria-selected", "true");
        await page.waitForTimeout(150);
        if (process.env.SNAP) {
            await dialog.screenshot({path: `e2e/.snaps/search-${theme.name}.png`});
        }
    });
}
