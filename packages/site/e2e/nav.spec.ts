import {expect, test} from "./fixtures";

test("mobile: the menu sheet holds the nav and the ports tree", async ({page}) => {
    await page.setViewportSize({width: 390, height: 844});
    await page.goto("ports");
    await expect(page.getByRole("complementary")).toBeHidden(); // desktop sidebar
    await page.getByRole("button", {name: "Menu"}).click();
    const sheet = page.getByRole("dialog");
    await expect(sheet.getByRole("link", {name: "Palette"})).toBeVisible();
    await sheet.getByRole("link", {name: "kitty"}).click();
    await expect(page).toHaveURL(/ports\/kitty$/);
    await expect(sheet).toBeHidden();
});

test("header stays on screen while scrolling", async ({page}) => {
    await page.goto("palette");
    await page.mouse.wheel(0, 3000);
    await expect(page.locator("header").first()).toBeInViewport();
});

test("desktop: the sidebar stays below the header and scrolls on its own to its end", async ({page}) => {
    // the suite's SiteSidebar (kernelkit): sticky under the header, its own scroll area
    await page.setViewportSize({width: 1280, height: 500});
    await page.goto("ports");
    const sidebar = page.getByRole("complementary", {name: "Ports"});
    await expect(page.getByText("Alacritty").last()).toBeVisible();
    await page.mouse.wheel(0, 3000);
    await expect(sidebar.getByText("All ports")).toBeInViewport();
    await sidebar.hover();
    for (let i = 0; i < 10; i++) {
        await page.mouse.wheel(0, 400);
    }
    const last = sidebar.getByRole("button").last();
    await expect(last).toBeInViewport();
});

test("header nav marks only the most specific section as current", async ({page}) => {
    const nav = page.getByRole("banner").getByRole("navigation", {name: "Site"});
    const current = nav.locator("[aria-current=page]");
    for (const [path, label] of [
        ["ports", "Ports"],
        ["ports/kitty", "Ports"],
        ["ports/wallpapers", "Wallpapers"],
        ["palette", "Palette"],
    ] as const) {
        await page.goto(path);
        await expect(current).toHaveCount(1);
        await expect(current).toHaveText(label);
    }
    await page.goto("");
    await expect(current).toHaveCount(0);
    await nav.getByRole("link", {name: "Wallpapers"}).click();
    await expect(page).toHaveURL(/ports\/wallpapers$/);
});
