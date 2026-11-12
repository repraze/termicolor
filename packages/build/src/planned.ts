import type {PlannedPort} from "./port.ts";

/**
 * Ports not built yet, ranked from the most-starred Catppuccin ports plus what we use.
 * Move an entry out of here when its `ports/<id>/port.ts` lands.
 */
export const PLANNED: PlannedPort[] = [
    // tier 3 - only if asked
    {id: "kde", name: "KDE Plasma", category: "system", description: "Linux desktop", tier: 3, catppuccinStars: 1106},
    {id: "gtk", name: "GTK", category: "system", description: "Linux toolkit", tier: 3, catppuccinStars: 945},
    {
        id: "hyprland",
        name: "Hyprland",
        category: "system",
        description: "Wayland compositor",
        tier: 3,
        catppuccinStars: 424,
    },
    {
        id: "vscode-icons",
        name: "VS Code icons",
        category: "editor",
        description: "File icon set",
        tier: 3,
        catppuccinStars: 1040,
    },
];
