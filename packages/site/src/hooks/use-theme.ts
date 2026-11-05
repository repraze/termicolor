import {useColorScheme, useLocalStorage} from "@mantine/hooks";
import {useEffect} from "react";

export type ThemePreference = "system" | "dark" | "light";

/** Theme preference persisted in localStorage; "system" follows the OS. Applies `.dark` on <html>. */
export function useTheme() {
    const system = useColorScheme("dark");
    const [preference, setPreference] = useLocalStorage<ThemePreference>({
        key: "termicolor-theme",
        defaultValue: "system",
        getInitialValueInEffect: false,
    });
    const resolved = preference === "system" ? system : preference;

    useEffect(() => {
        document.documentElement.classList.toggle("dark", resolved === "dark");
        document.documentElement.style.colorScheme = resolved;
    }, [resolved]);

    return {preference, resolved, setPreference};
}
