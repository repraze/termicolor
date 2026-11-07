import {useColorScheme} from "@mantine/hooks";
import {type AccentName, ACCENTS, DEFAULT_ACCENT, type ModeId} from "@repraze/termicolor";
import {useEffect} from "react";

import {SITE_ACCENT} from "@/lib/site";
import {oneOf, stored, useStored} from "@/lib/stored";

export type ThemePreference = "system" | "dark" | "light";
export type ContrastPreference = "normal" | "high";

/** Same keys as the pre-paint script in index.html and the e2e fixtures. */
export const THEME_KEY = "termicolor-theme";
export const CONTRAST_KEY = "termicolor-contrast";
export const ACCENT_KEY = "termicolor-accent";
export const PORT_ACCENT_KEY = "termicolor-port-accent";

const themeStore = stored<ThemePreference>(THEME_KEY, "system", oneOf(["system", "dark", "light"]));
const contrastStore = stored<ContrastPreference>(CONTRAST_KEY, "normal", oneOf(["normal", "high"]));
/** The site's own accent (the theme menu). */
const accentStore = stored<AccentName>(ACCENT_KEY, SITE_ACCENT, oneOf(ACCENTS));
/** The accent ports are built with on port pages: separate from the site's, defaulting to the ports' own. */
const portAccentStore = stored<AccentName>(PORT_ACCENT_KEY, DEFAULT_ACCENT, oneOf(ACCENTS));

/** Accent picked for port files, shared by every port page and every tab. */
export function usePortAccent() {
    return useStored(portAccentStore);
}

export {SITE_ACCENT};

/** `.light`/`.dark`, `.hc` and `.accent-<name>` on <html>; palette.css scopes every variable to those classes. */
export function themeClasses(
    scheme: "dark" | "light",
    contrast: ContrastPreference,
    accent: AccentName = SITE_ACCENT,
): Record<string, boolean> {
    return {
        light: scheme === "light",
        dark: scheme === "dark",
        hc: contrast === "high",
        ...Object.fromEntries(ACCENTS.map((n) => [`accent-${n}`, n === accent])),
    };
}

export function modeId(scheme: "dark" | "light", contrast: ContrastPreference): ModeId {
    return contrast === "high" ? `${scheme}-hc` : scheme;
}

/** Theme, contrast and accent, persisted and synced across tabs; "system" follows the OS color scheme. */
export function useTheme() {
    const system = useColorScheme("dark");
    const [preference, setPreference] = useStored(themeStore);
    const [contrast, setContrast] = useStored(contrastStore);
    const [accent, setAccent] = useStored(accentStore);
    const resolved = preference === "system" ? system : preference;

    useEffect(() => {
        for (const [name, on] of Object.entries(themeClasses(resolved, contrast, accent))) {
            document.documentElement.classList.toggle(name, on);
        }
    }, [resolved, contrast, accent]);

    return {
        preference,
        resolved,
        setPreference,
        contrast,
        setContrast,
        accent,
        setAccent,
        mode: modeId(resolved, contrast),
    };
}
