import {type Page, test as base} from "@playwright/test";

export const THEMES = [
    {name: "dark", scheme: "dark", contrast: false},
    {name: "light", scheme: "light", contrast: false},
    {name: "dark-hc", scheme: "dark", contrast: true},
    {name: "light-hc", scheme: "light", contrast: true},
] as const;
export type Theme = (typeof THEMES)[number];

/** Seeds the persisted theme before any page script runs. */
export async function useTheme(page: Page, theme: Theme, accent?: string) {
    await page.addInitScript(
        ([scheme, contrast, accent]) => {
            localStorage.setItem("termicolor-theme", JSON.stringify(scheme));
            localStorage.setItem("termicolor-contrast", JSON.stringify(contrast ? "high" : "normal"));
            if (accent) {
                localStorage.setItem("termicolor-accent", JSON.stringify(accent));
            }
        },
        [theme.scheme, theme.contrast, accent] as const,
    );
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
