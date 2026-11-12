import type {PlannedPort} from "./port.ts";

/**
 * Ports not built yet, ranked from the most-starred Catppuccin ports plus what we use.
 * Move an entry out of here when its `ports/<id>/port.ts` lands.
 */
export const PLANNED: PlannedPort[] = [
    // tier 1 - nearly free once ANSI exists
    {
        id: "windows-theme",
        name: "Windows theme pack",
        category: "system",
        description: "Wallpapers + accent color in one install",
        tier: 1,
        tags: ["deskthemepack"],
    },
    // tier 2 - moderate work
    {
        id: "discord",
        name: "Discord",
        category: "app",
        description: "Vencord / BetterDiscord CSS",
        tier: 2,
        catppuccinStars: 1456,
    },
    {
        id: "dark-reader",
        name: "Dark Reader",
        category: "browser",
        description: "Dark Reader preset",
        tier: 2,
        catppuccinStars: 466,
    },
    {
        id: "userstyles",
        name: "Userstyles",
        category: "browser",
        description: "Website restyles (GitHub first)",
        tier: 2,
        catppuccinStars: 1146,
        tags: ["stylus", "github"],
    },
    {
        id: "spicetify",
        name: "Spotify (Spicetify)",
        category: "app",
        description: "Spotify theme",
        tier: 2,
        catppuccinStars: 604,
    },
    {id: "telegram", name: "Telegram", category: "app", description: "Desktop theme", tier: 2, catppuccinStars: 307},
    {
        id: "nilesoft-shell",
        name: "Nilesoft Shell",
        category: "system",
        description: "Windows context menu",
        tier: 2,
        catppuccinStars: 299,
    },
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
