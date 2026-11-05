import {MonitorIcon, MoonIcon, SunIcon} from "lucide-react";

import {ToggleGroup, ToggleGroupItem} from "@/components/ui/toggle-group";
import {type ThemePreference, useTheme} from "@/hooks/use-theme";

const OPTIONS = [
    {value: "light", label: "Light", icon: SunIcon},
    {value: "system", label: "System", icon: MonitorIcon},
    {value: "dark", label: "Dark", icon: MoonIcon},
] as const;

export function ThemeToggle() {
    const {preference, setPreference} = useTheme();
    return (
        <ToggleGroup
            value={[preference]}
            onValueChange={(value: string[]) => {
                if (value[0]) {
                    setPreference(value[0] as ThemePreference);
                }
            }}
            size="sm"
        >
            {OPTIONS.map(({value, label, icon: Icon}) => (
                <ToggleGroupItem key={value} value={value} aria-label={label}>
                    <Icon />
                </ToggleGroupItem>
            ))}
        </ToggleGroup>
    );
}
