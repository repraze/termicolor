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
    {
        id: "wallpapers",
        name: "Wallpapers",
        category: "wallpaper",
        description: "Generated gradients, grids, circuits, contours",
        tier: 1,
        tags: ["background"],
    },
    // tier 2 - moderate work
    {
        id: "nvim",
        name: "Neovim",
        category: "editor",
        description: "Lua colorscheme",
        tier: 2,
        catppuccinStars: 7657,
        tags: ["vim"],
    },
    {
        id: "tmux",
        name: "tmux",
        category: "terminal",
        description: "Terminal multiplexer",
        tier: 2,
        catppuccinStars: 3213,
    },
    {id: "zed", name: "Zed", category: "editor", description: "Rust editor", tier: 2, catppuccinStars: 927},
    {
        id: "jetbrains",
        name: "JetBrains IDEs",
        category: "editor",
        description: "IntelliJ, WebStorm, ...",
        tier: 2,
        catppuccinStars: 577,
    },
    {id: "firefox", name: "Firefox", category: "browser", description: "Browser theme", tier: 2, catppuccinStars: 752},
    {id: "obsidian", name: "Obsidian", category: "app", description: "Notes app theme", tier: 2, catppuccinStars: 651},
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
