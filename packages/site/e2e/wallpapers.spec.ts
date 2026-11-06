import type {Page} from "@playwright/test";

import {expect, test, useTheme} from "./fixtures";

const cards = (page: Page) => page.getByTestId("wallpaper-card");

test("wallpapers gallery shows thumbnails that load", async ({page, errors}) => {
    await page.goto("ports/wallpapers");
    await expect(cards(page).first()).toBeVisible();
    expect(await cards(page).count()).toBeGreaterThan(10);
    const thumb = cards(page).first().locator("img");
    await expect(thumb).toHaveAttribute("loading", "lazy");
    await expect.poll(() => thumb.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBe(480);
    expect(errors).toEqual([]);
});

test("wallpaper download links point to existing SVGs", async ({page, request}) => {
    await page.goto("ports/wallpapers");
    const links = cards(page)
        .first()
        .getByRole("link", {name: /^Download/});
    await expect(links).toHaveCount(3);
    for (const link of await links.all()) {
        await expect(link).toHaveAttribute("download", /\.svg$/);
        const href = (await link.getAttribute("href"))!;
        const res = await request.get(new URL(href, page.url()).href);
        expect(res.status()).toBe(200);
        expect(await res.text()).toContain("<svg");
    }
});

test("wallpaper mode follows the site theme and filters narrow the grid", async ({page}) => {
    await useTheme(page, {name: "light", scheme: "light", contrast: false});
    await page.goto("ports/wallpapers");
    await expect(page.getByRole("group", {name: "Mode"}).getByRole("button", {name: "Light"})).toHaveAttribute(
        "aria-pressed",
        "true",
    );
    const first = cards(page).first().locator("img");
    await expect(first).toHaveAttribute("src", /thumbs\/light\/landscape\//);

    await page.getByRole("group", {name: "Orientation"}).getByRole("button", {name: "Portrait"}).click();
    await expect(first).toHaveAttribute("src", /thumbs\/light\/portrait\//);
    await expect(
        cards(page)
            .first()
            .getByRole("link", {name: /^Download/})
            .first(),
    ).toHaveAttribute("href", /dist\/light\/1080x1920\//);

    const all = await cards(page).count();
    await page.getByRole("group", {name: "Family"}).getByRole("button", {name: "Gradients"}).click();
    await expect(cards(page)).not.toHaveCount(all);
    await expect(page).toHaveURL(/family=gradients/);
});

test("wallpaper thumbnail opens a preview with the SVG and downloads", async ({page}) => {
    await page.goto("ports/wallpapers");
    await cards(page)
        .first()
        .getByRole("button", {name: /^Preview/})
        .click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.locator("img")).toHaveAttribute("src", /\/dist\/(dark|light)\/1920x1080\/.+\.svg$/);
    await expect(dialog.getByRole("link", {name: /^Download/})).toHaveCount(3);
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
});
