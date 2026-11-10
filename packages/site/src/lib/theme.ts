import type {ThemeState} from "@repraze/kernelkit/theme";
import type {ModeId} from "@repraze/termicolor";

import {SITE_ACCENT} from "./site";

/**
 * The site theme is KernelKit's ThemeProvider (mode, contrast, accent, radius in one JSON object), so the
 * header's ThemeMenu is the same as every suite site's. No `@/` imports: vite.config.ts loads this file
 * for the pre-paint script, and the e2e fixtures write the same key.
 */
export const THEME_KEY = "termicolor-theme";
/** Before the kit provider: mode in THEME_KEY as a bare string, contrast and accent in their own keys. */
export const LEGACY_CONTRAST_KEY = "termicolor-contrast";
export const LEGACY_ACCENT_KEY = "termicolor-accent";

/** What a visitor who never picked gets, and what Reset restores: brand red, square corners. */
export const SITE_THEME = {accent: SITE_ACCENT, radius: "none"} as const satisfies Partial<ThemeState>;

export function modeId(scheme: "dark" | "light", contrast: ThemeState["contrast"]): ModeId {
    return contrast === "high" ? `${scheme}-hc` : scheme;
}

/**
 * Pre-paint script source (runs before the kit's theme script): moves a pre-kit choice (mode as a bare
 * string in THEME_KEY, contrast and accent in their own keys) into the provider's one object, once.
 * A string, not a function's source, so no bundler helper can end up inlined; tested in use-theme.test.ts.
 */
export const LEGACY_THEME_MIGRATION = `(function(){try{var s=localStorage,k=${JSON.stringify(THEME_KEY)},ck=${JSON.stringify(LEGACY_CONTRAST_KEY)},ak=${JSON.stringify(LEGACY_ACCENT_KEY)};
var r=function(key){try{return JSON.parse(s.getItem(key))}catch(e){return null}};
var t=r(k),c=r(ck),a=r(ak);if(t!==null&&typeof t==="object")return;if(t===null&&c===null&&a===null)return;
var n={};if(typeof t==="string")n.mode=t;if(typeof c==="string")n.contrast=c;if(typeof a==="string")n.accent=a;
s.setItem(k,JSON.stringify(n));s.removeItem(ck);s.removeItem(ak)}catch(e){}})();`;
