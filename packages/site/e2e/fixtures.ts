import {type Page, test as base} from "@playwright/test";

import {THEME_KEY} from "../src/lib/theme";

export const THEMES = [
    {name: "dark", scheme: "dark", contrast: false},
    {name: "light", scheme: "light", contrast: false},
    {name: "dark-hc", scheme: "dark", contrast: true},
    {name: "light-hc", scheme: "light", contrast: true},
] as const;
export type Theme = (typeof THEMES)[number];

/**
 * Seeds the persisted theme before any page script runs: KernelKit's ThemeProvider object under
 * THEME_KEY. Fields left out (accent, radius) fall back to the site's defaults.
 */
export async function useTheme(page: Page, theme: Theme, accent?: string) {
    await page.addInitScript(([key, value]) => localStorage.setItem(key, value), [
        THEME_KEY,
        JSON.stringify({mode: theme.scheme, contrast: theme.contrast ? "high" : "normal", ...(accent && {accent})}),
    ] as const);
}

/** Fails the test on uncaught page errors and console errors. */
export const test = base.extend<{errors: string[]}>({
    errors: [
        async ({page}, use) => {
            const errors: string[] = [];
            page.on("pageerror", (e) => errors.push(e.message));
            page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
            await use(errors);
        },
        {auto: true},
    ],
});
export {expect} from "@playwright/test";
