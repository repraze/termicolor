import {expect, test, THEMES, useTheme} from "./fixtures";
import {ROUTES} from "./routes";

/** Full-page screenshots of every route in every theme, written to e2e/.snaps/ (gitignored) for review. */
test.skip(!process.env.SNAP, "run with `npm run snap`");

const VIEWPORTS = [
    {name: "desktop", width: 1280, height: 900},
    {name: "mobile", width: 390, height: 844},
] as const;

for (const route of ROUTES) {
    for (const theme of THEMES) {
        for (const vp of VIEWPORTS) {
            test(`snap ${route.name} ${theme.name} ${vp.name}`, async ({page, errors}) => {
                await page.setViewportSize(vp);
                await useTheme(page, theme);
                await page.goto(route.path);
                await page.waitForLoadState("networkidle");
                await page.evaluate(() => document.fonts.ready);
                const suffix = vp.name === "desktop" ? "" : `--${vp.name}`;
                await page.screenshot({path: `e2e/.snaps/${route.name}--${theme.name}${suffix}.png`, fullPage: true});
                expect(errors).toEqual([]);
            });
        }
    }
}
