import {Button} from "@repraze/kernelkit/components/button";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@repraze/kernelkit/components/dropdown-menu";
import {type AccentName, ACCENTS} from "@repraze/termicolor";
import {ContrastIcon, MonitorIcon, MoonIcon, SunIcon} from "lucide-react";

import {type ThemePreference, useTheme} from "@/hooks/use-theme";

const OPTIONS = [
    {value: "system", label: "System", icon: MonitorIcon},
    {value: "dark", label: "Dark", icon: MoonIcon},
    {value: "light", label: "Light", icon: SunIcon},
] as const;

export function ThemeToggle() {
    const {preference, setPreference, resolved, contrast, setContrast, accent, setAccent} = useTheme();
    const Current = resolved === "dark" ? MoonIcon : SunIcon;
    return (
        <DropdownMenu>
            <DropdownMenuTrigger
                render={<Button variant="ghost" size="sm" aria-label="Theme" data-testid="theme-menu" />}
            >
                <Current />
                {contrast === "high" && <ContrastIcon />}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuGroup>
                    <DropdownMenuLabel>Theme</DropdownMenuLabel>
                    <DropdownMenuRadioGroup
                        value={preference}
                        onValueChange={(value) => setPreference(value as ThemePreference)}
                    >
                        {OPTIONS.map(({value, label, icon: Icon}) => (
                            <DropdownMenuRadioItem key={value} value={value}>
                                <Icon /> {label}
                            </DropdownMenuRadioItem>
                        ))}
                    </DropdownMenuRadioGroup>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                    <DropdownMenuLabel>Accent</DropdownMenuLabel>
                    <DropdownMenuRadioGroup value={accent} onValueChange={(value) => setAccent(value as AccentName)}>
                        {ACCENTS.map((name) => (
                            <DropdownMenuRadioItem key={name} value={name} className="capitalize">
                                <span className="size-3 border" style={{background: `var(--tc-${name}-fill)`}} />
                                {name}
                            </DropdownMenuRadioItem>
                        ))}
                    </DropdownMenuRadioGroup>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem
                    checked={contrast === "high"}
                    onCheckedChange={(checked) => setContrast(checked ? "high" : "normal")}
                >
                    <ContrastIcon /> High contrast
                </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
