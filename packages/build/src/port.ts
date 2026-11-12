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

/**
 * Someone loaded the port in the real app and checked it (TESTING.md). Ports without it show as
 * "needs testing" on the site, with a link to report a test.
 */
export type Verified = {
    /** When it was last checked (YYYY-MM-DD). Re-check after big changes to the port. */
    date: string;
    /** The test report issue, with screenshots, when it came from one. */
    issue?: number;
};

export type PortDefinition = PortMeta & {
    /** Markdown install steps. Paths are relative to the port's `dist/`. */
    install: string;
    verified?: Verified;
    build(palette: Palette): PortFile[];
};

export type PlannedPort = PortMeta & {
    /** Stars on the matching Catppuccin port (2026-11), used to rank what to build next. */
    catppuccinStars?: number;
    tier: 1 | 2 | 3;
};

export const REPO_URL = "https://github.com/repraze/termicolor";

/** New-issue URL for a port test report, with the form's fields pre-filled (.github/ISSUE_TEMPLATE/port-test.yml). */
export function testReportUrl(port: Pick<PortMeta, "id" | "name">): string {
    const params = new URLSearchParams({template: "port-test.yml", title: `[test] ${port.name}`, port: port.id});
    return `${REPO_URL}/issues/new?${params}`;
}

export function definePort(port: PortDefinition): PortDefinition {
    return port;
}

export function json(value: unknown): string {
    return `${JSON.stringify(value, null, 4)}\n`;
}
