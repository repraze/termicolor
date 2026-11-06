import {useColorScheme, useLocalStorage} from "@mantine/hooks";
import type {ModeId} from "@termicolor/palette";
import {useEffect} from "react";

export type ThemePreference = "system" | "dark" | "light";
export type ContrastPreference = "normal" | "high";

/** Same keys as the pre-paint script in index.html and the e2e fixtures. */
export const THEME_KEY = "termicolor-theme";
export const CONTRAST_KEY = "termicolor-contrast";

/** `.light`/`.dark` plus `.hc` on <html>; palette.css scopes every variable to those classes. */
export function themeClasses(scheme: "dark" | "light", contrast: ContrastPreference) {
    return {light: scheme === "light", dark: scheme === "dark", hc: contrast === "high"};
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
    const resolved = preference === "system" ? system : preference;

    useEffect(() => {
        for (const [name, on] of Object.entries(themeClasses(resolved, contrast))) {
            document.documentElement.classList.toggle(name, on);
        }
    }, [resolved, contrast]);

    return {preference, resolved, setPreference, contrast, setContrast, mode: modeId(resolved, contrast)};
}
