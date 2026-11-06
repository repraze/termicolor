import AxeBuilder from "@axe-core/playwright";

import {expect, test, THEMES, useTheme} from "./fixtures";
import {ROUTES} from "./routes";

/** The site is the palette's showcase: every route must pass WCAG contrast in every theme. */
for (const route of ROUTES) {
    for (const theme of THEMES) {
        test(`contrast ${route.name} ${theme.name}`, async ({page}) => {
            await useTheme(page, theme);
            await page.goto(route.path);
            await page.waitForLoadState("networkidle");
            const results = await new AxeBuilder({page}).withRules(["color-contrast"]).analyze();
            const failures = results.violations.flatMap((v) =>
                v.nodes.map((n) => `${n.target.join(" ")}: ${n.failureSummary?.split("\n").at(-1)?.trim()}`),
            );
            expect(failures).toEqual([]);
        });
    }
}
