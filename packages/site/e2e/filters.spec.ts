import {expect, test} from "./fixtures";

/** Filters are state in the URL: clicking one replaces the entry and keeps the scroll position. */
for (const {name, path, click} of [
    {name: "wallpapers orientation", path: "ports/wallpapers", click: "Portrait"},
    {name: "ports status", path: "ports", click: "Planned"},
]) {
    test(`${name} filter updates the URL in place`, async ({page}) => {
        await page.setViewportSize({width: 1280, height: 720});
        await page.goto(path);
        const button = page.getByRole("button", {name: click, exact: true}).first();
        await button.waitFor();
        // scroll a little, keeping the button on screen (Playwright scrolls hidden targets into view);
        // small enough that the filtered page (only a few planned ports) can still hold it
        await page.evaluate(() => window.scrollTo(0, 40));
        const historyBefore = await page.evaluate(() => history.length);
        await button.click();
        await expect(page).toHaveURL(new RegExp(`${click.toLowerCase()}`));
        expect(await page.evaluate(() => scrollY)).toBe(40);
        expect(await page.evaluate(() => history.length)).toBe(historyBefore);
    });
}
