import {useColorScheme, useLocalStorage} from "@mantine/hooks";
import {type AccentName, ACCENTS, type ModeId} from "@termicolor/palette";
import {useEffect} from "react";

import {SITE_ACCENT} from "@/lib/site";

export type ThemePreference = "system" | "dark" | "light";
export type ContrastPreference = "normal" | "high";

/** Same keys as the pre-paint script in index.html and the e2e fixtures. */
export const THEME_KEY = "termicolor-theme";
export const CONTRAST_KEY = "termicolor-contrast";
export const ACCENT_KEY = "termicolor-accent";

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

/** Theme + contrast preference persisted in localStorage; "system" follows the OS color scheme. */
export function useTheme() {
    const system = useColorScheme("dark");
    const [preference, setPreference] = useLocalStorage<ThemePreference>({
        key: THEME_KEY,
        defaultValue: "system",
        getInitialValueInEffect: false,
    });
    const [contrast, setContrast] = useLocalStorage<ContrastPreference>({
        key: CONTRAST_KEY,
        defaultValue: "normal",
        getInitialValueInEffect: false,
    });
    const [accent, setAccent] = useLocalStorage<AccentName>({
        key: ACCENT_KEY,
        defaultValue: SITE_ACCENT,
        getInitialValueInEffect: false,
    });
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
