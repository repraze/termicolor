import {palette} from "@termicolor/palette";

import {expect, test, useTheme} from "./fixtures";

test("port files follow the site accent and can be rebuilt for any accent", async ({page}) => {
    await useTheme(page, {name: "dark", scheme: "dark", contrast: false}, "purple");
    await page.goto("ports/kitty");
    const code = page.getByTestId("port-files").locator(".shiki");
    const cursorLine = (hex: string) => new RegExp(`cursor\\s+${hex}`, "i");
    // the site accent is the default
    await expect(code).toContainText(cursorLine(palette.modes.dark.accentRoles.purple.cursor));

    await page.getByRole("group", {name: "Accent"}).getByRole("button", {name: "pink"}).click();
    await expect(page).toHaveURL(/accent=pink/);
    await expect(code).toContainText(cursorLine(palette.modes.dark.accentRoles.pink.cursor));

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
