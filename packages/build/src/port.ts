import type {Palette} from "@repraze/termicolor";

export const CATEGORIES = {
    editor: "Editors",
    terminal: "Terminals",
    shell: "Shells & prompts",
    cli: "CLI tools",
    browser: "Browsers",
    web: "Web & libraries",
    app: "Apps",
    system: "System",
    wallpaper: "Wallpapers",
} as const;
export type Category = keyof typeof CATEGORIES;

export type PortMeta = {
    /** Folder name under `ports/`, also the URL slug. */
    id: string;
    name: string;
    category: Category;
    description: string;
    /** The app's own site. */
    homepage?: string;
    /** Extra search terms. */
    tags?: string[];
};

export type PortFile = {path: string; contents: string};

export type PortDefinition = PortMeta & {
    /** Markdown install steps. Paths are relative to the port's `dist/`. */
    install: string;
    build(palette: Palette): PortFile[];
};

export type PlannedPort = PortMeta & {
    /** Stars on the matching Catppuccin port (2026-11), used to rank what to build next. */
    catppuccinStars?: number;
    tier: 1 | 2 | 3;
};

export function definePort(port: PortDefinition): PortDefinition {
    return port;
}

export function json(value: unknown): string {
    return `${JSON.stringify(value, null, 4)}\n`;
}
