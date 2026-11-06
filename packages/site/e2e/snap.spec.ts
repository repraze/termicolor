import {expect, test, THEMES, useTheme} from "./fixtures";
import {ROUTES} from "./routes";

/** Full-page screenshots of every route in every theme, written to e2e/.snaps/ (gitignored) for review. */
test.skip(!process.env.SNAP, "run with `npm run snap`");

for (const route of ROUTES) {
    for (const theme of THEMES) {
        test(`snap ${route.name} ${theme.name}`, async ({page, errors}) => {
            await useTheme(page, theme);
            await page.goto(route.path);
            await page.waitForLoadState("networkidle");
            await page.evaluate(() => document.fonts.ready);
            await page.screenshot({path: `e2e/.snaps/${route.name}--${theme.name}.png`, fullPage: true});
            expect(errors).toEqual([]);
        });
    }
}
