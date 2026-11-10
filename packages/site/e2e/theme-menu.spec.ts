import {THEME_KEY} from "../src/lib/theme";
import {expect, test, THEMES, useTheme} from "./fixtures";

const box = (el: Element) => {
    const r = el.getBoundingClientRect();
    return {width: r.width, height: r.height, centerY: r.top + r.height / 2};
};

/** KernelKit's ThemeMenu: one header button for mode, accent, contrast, radius and reset (GUIDELINES §7b). */
test.describe("theme menu", () => {
    for (const width of [1280, 390]) {
        test(`trigger lines up with the header's icon buttons at ${width}px`, async ({page}) => {
            await page.setViewportSize({width, height: 800});
            await page.goto("");
            const actions = page.locator('[data-slot="site-header-actions"]');
            const trigger = page.getByTestId("theme-menu");
            const github = actions.locator('a[aria-label="GitHub"]');
            const search = actions.locator('[data-slot="search-trigger"]');
            const [t, g, s] = await Promise.all([trigger.evaluate(box), github.evaluate(box), search.evaluate(box)]);
            // same box as the GitHub icon button, on the search field's center line
            expect(t).toEqual(g);
            expect(t.centerY).toBe(s.centerY);
            // same icon size and position inside it
            const [ti, gi] = await Promise.all([
                trigger.locator("svg").evaluate(box),
                github.locator("svg").evaluate(box),
            ]);
            expect(ti).toEqual(gi);
        });
    }

    test("the trigger icon is the chosen mode, and the menu switches it", async ({page}) => {
        await useTheme(page, THEMES[0]);
        await page.goto("");
        const trigger = page.getByTestId("theme-menu");
        await expect(trigger).toHaveAccessibleName("Theme: Dark");
        await expect(trigger).toHaveAttribute("data-mode", "dark");
        await trigger.click();
        await page.getByRole("group", {name: "Mode"}).getByRole("button", {name: "Light"}).click();
        await expect(page.locator("html")).toHaveClass(/(^| )light( |$)/);
        await expect(trigger).toHaveAccessibleName("Theme: Light");
        await page.getByRole("group", {name: "Mode"}).getByRole("button", {name: "System"}).click();
        await expect(trigger).toHaveAttribute("data-mode", "system");
    });

    test("accent, contrast and radius apply, persist, and Reset restores the site defaults", async ({page}) => {
        await page.goto("");
        const html = page.locator("html");
        await expect(html).toHaveClass(/accent-red/);
        await expect(html).toHaveClass(/radius-none/);
        await page.getByTestId("theme-menu").click();
        const menu = page.locator('[data-slot="theme-menu-content"]');
        const reset = menu.getByRole("button", {name: "Reset to defaults"});
        await expect(reset).toBeDisabled();

        await menu.getByRole("button", {name: "pink"}).click();
        await menu.getByRole("switch").click();
        await menu.getByRole("group", {name: "Radius"}).getByRole("button", {name: "lg"}).click();
        await expect(html).toHaveClass(/accent-pink/);
        await expect(html).toHaveClass(/(^| )hc( |$)/);
        await expect(html).toHaveClass(/radius-lg/);
        // the radius knob reaches the kit's corners (the site no longer pins --kk-radius on :root)
        expect(await html.evaluate((el) => getComputedStyle(el).getPropertyValue("--kk-radius").trim())).toBe(
            "0.75rem",
        );
        expect(JSON.parse((await page.evaluate((k) => localStorage.getItem(k), THEME_KEY))!)).toMatchObject({
            accent: "pink",
            contrast: "high",
            radius: "lg",
        });

        await page.reload();
        await expect(html).toHaveClass(/accent-pink/);
        await expect(html).toHaveClass(/radius-lg/);

        await page.getByTestId("theme-menu").click();
        await expect(reset).toBeEnabled();
        await reset.click();
        await expect(html).toHaveClass(/accent-red/);
        await expect(html).toHaveClass(/radius-none/);
        await expect(html).not.toHaveClass(/(^| )hc( |$)/);
        await expect(reset).toBeDisabled();
        expect(await page.evaluate((k) => localStorage.getItem(k), THEME_KEY)).toBeNull();
    });

    test("works from the keyboard", async ({page}) => {
        await useTheme(page, THEMES[0]);
        await page.goto("");
        const trigger = page.getByTestId("theme-menu");
        await trigger.focus();
        await page.keyboard.press("Enter");
        const menu = page.locator('[data-slot="theme-menu-content"]');
        await expect(menu).toBeVisible();
        // focus moved into the menu, on the mode control
        await expect(menu.getByRole("group", {name: "Mode"}).getByRole("button", {name: "Light"})).toBeFocused();
        await page.keyboard.press("Enter");
        await expect(page.locator("html")).toHaveClass(/(^| )light( |$)/);
        // Tab reaches the accent swatches, then the contrast switch
        await page.keyboard.press("Tab");
        await expect(menu.getByRole("button", {name: "red"})).toBeFocused();
        for (let i = 0; i < 8; i++) {
            await page.keyboard.press("Tab");
        }
        await expect(menu.getByRole("switch")).toBeFocused();
        await page.keyboard.press("Space");
        await expect(page.locator("html")).toHaveClass(/(^| )hc( |$)/);
        await page.keyboard.press("Escape");
        await expect(menu).toBeHidden();
        await expect(trigger).toBeFocused();
    });

    test("carries over a choice stored by the old three-key theme", async ({page}) => {
        await page.addInitScript(() => {
            if (!sessionStorage.getItem("seeded")) {
                sessionStorage.setItem("seeded", "1");
                localStorage.setItem("termicolor-theme", JSON.stringify("light"));
                localStorage.setItem("termicolor-contrast", JSON.stringify("high"));
                localStorage.setItem("termicolor-accent", JSON.stringify("cyan"));
            }
        });
        await page.goto("");
        const html = page.locator("html");
        await expect(html).toHaveClass(/(^| )light( |$)/);
        await expect(html).toHaveClass(/(^| )hc( |$)/);
        await expect(html).toHaveClass(/accent-cyan/);
        const stored = await page.evaluate(() => ({...localStorage}));
        expect(JSON.parse(stored["termicolor-theme"]!)).toMatchObject({
            mode: "light",
            contrast: "high",
            accent: "cyan",
        });
        expect(stored["termicolor-contrast"]).toBeUndefined();
        expect(stored["termicolor-accent"]).toBeUndefined();
    });
});
