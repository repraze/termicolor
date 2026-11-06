import {queryOptions} from "@tanstack/react-query";
import {CATEGORIES} from "@termicolor/build";
import {ACCENTS, type ModeId} from "@termicolor/palette";
import MiniSearch, {type Options, type SearchResult} from "minisearch";

import type {RegistryEntry} from "./registry";
import {dataUrl} from "./registry";
import type {WallpaperCatalog} from "./wallpapers";

/**
 * Site search. `scripts/search-index.ts` runs `buildDocs` at build time and serializes the MiniSearch
 * index to `data/search.json`; the header's search dialog loads it on first open.
 */

export type SearchKind = "page" | "port" | "palette" | "wallpaper";

export type SearchDoc = {
    id: string;
    kind: SearchKind;
    title: string;
    /** one line shown under the title */
    summary: string;
    /** everything else that should match: install steps, tags, file names, usage notes */
    body: string;
    /** a site path relative to the base, plus optional search params and hash */
    to: string;
    search?: Record<string, string>;
    hash?: string;
    planned?: boolean;
};

type Stored = Omit<SearchDoc, "body">;
export type SearchHit = Stored & {score: number};

export const SEARCH_OPTIONS: Options<SearchDoc> = {
    fields: ["title", "summary", "body"],
    storeFields: ["kind", "title", "summary", "to", "search", "hash", "planned"],
    searchOptions: {
        boost: {title: 4, summary: 2},
        prefix: true,
        fuzzy: (term) => (term.length > 3 ? 0.2 : false),
        combineWith: "AND",
    },
};

export type SearchSources = {
    registry: RegistryEntry[];
    catalog: WallpaperCatalog;
    /** packages/palette/DESIGN.md: role usage comes from its tables */
    design: string;
};

const MODE_NAMES: Record<ModeId, string> = {
    dark: "Dark",
    light: "Light",
    "dark-hc": "Dark high contrast",
    "light-hc": "Light high contrast",
};

/** Strips markdown down to words: code fences keep their content, punctuation goes. */
export function plainText(markdown: string): string {
    return markdown
        .replace(/```\w*\n?/g, " ")
        .replace(/[`*_#>|[\]()]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

/** `| \`role\` / \`other\` | use |` rows from DESIGN.md tables → role name → usage. */
export function designRoles(design: string): Map<string, string> {
    const roles = new Map<string, string>();
    for (const line of design.split("\n")) {
        const cells = line.split("|").map((c) => c.trim());
        if (cells.length < 4 || !cells[1]!.startsWith("`")) {
            continue;
        }
        const names = [...cells[1]!.matchAll(/`([a-zA-Z][\w-]*)`/g)].map((m) => m[1]!);
        const use = plainText(cells.slice(2, -1).join(" "));
        for (const name of names) {
            roles.set(name, roles.has(name) ? `${roles.get(name)} ${use}` : use);
        }
    }
    return roles;
}

export function buildDocs({registry, catalog, design}: SearchSources): SearchDoc[] {
    const docs: SearchDoc[] = [
        {
            id: "page:home",
            kind: "page",
            title: "Home",
            summary: "Terminal colors: one palette for every app, in dark, light and high contrast.",
            body: "termicolor modes preview landing",
            to: "/",
        },
        {
            id: "page:ports",
            kind: "page",
            title: "All ports",
            summary: "Every app termicolor themes, available and planned.",
            body: Object.values(CATEGORIES).join(" "),
            to: "/ports",
        },
        {
            id: "page:palette",
            kind: "page",
            title: "Palette",
            summary: "Accents, roles, ANSI colors and contrast guarantees for each mode.",
            body: "swatches hex copy wcag contrast tiers fill text tint bright ansi dim",
            to: "/palette",
        },
    ];

    for (const entry of registry) {
        const category = CATEGORIES[entry.category];
        const common = [entry.id, category, ...(entry.tags ?? [])];
        docs.push(
            entry.status === "available"
                ? {
                      id: `port:${entry.id}`,
                      kind: "port",
                      title: entry.name,
                      summary: entry.description,
                      body: [...common, ...entry.files, plainText(entry.install)].join(" "),
                      to: `/ports/${entry.id}`,
                  }
                : {
                      id: `port:${entry.id}`,
                      kind: "port",
                      title: entry.name,
                      summary: entry.description,
                      body: common.join(" "),
                      to: "/ports",
                      search: {q: entry.name, status: "planned"},
                      planned: true,
                  },
        );
    }

    for (const id of Object.keys(MODE_NAMES) as ModeId[]) {
        docs.push({
            id: `palette:mode:${id}`,
            kind: "palette",
            title: `${MODE_NAMES[id]} mode`,
            summary: `Accents, roles and ANSI for ${MODE_NAMES[id].toLowerCase()}.`,
            body: id.endsWith("-hc") ? "hc accessibility borders" : "",
            to: "/palette",
            hash: id,
        });
    }
    for (const name of ACCENTS) {
        docs.push({
            id: `palette:accent:${name}`,
            kind: "palette",
            title: name,
            summary: `The ${name} accent: fill, text, tint and bright tiers.`,
            body: "accent color",
            to: "/palette",
        });
    }
    for (const [role, use] of designRoles(design)) {
        docs.push({
            id: `palette:role:${role}`,
            kind: "palette",
            title: role,
            summary: use,
            body: "role",
            to: "/palette",
        });
    }

    for (const [family, label] of Object.entries(catalog.families)) {
        const names = catalog.wallpapers.filter((w) => w.family === family).map((w) => w.name);
        docs.push({
            id: `wallpaper:${family}`,
            kind: "wallpaper",
            title: `${label} wallpapers`,
            summary: `${names.length} abstract wallpapers, dark and light, 1080p to 4K.`,
            body: `${[...new Set(names)].join(" ")} background desktop phone`,
            to: "/ports/wallpapers",
            search: {family},
        });
    }
    return docs;
}

export function createIndex(docs: SearchDoc[]): MiniSearch<SearchDoc> {
    const index = new MiniSearch<SearchDoc>(SEARCH_OPTIONS);
    index.addAll(docs);
    return index;
}

export function loadIndex(json: string): MiniSearch<SearchDoc> {
    return MiniSearch.loadJSON<SearchDoc>(json, SEARCH_OPTIONS);
}

export function search(index: MiniSearch<SearchDoc>, query: string, limit = 20): SearchHit[] {
    return index
        .search(query)
        .slice(0, limit)
        .map((r: SearchResult) => ({...(r as unknown as Stored), id: String(r.id), score: r.score}));
}

export const searchIndexQuery = queryOptions({
    queryKey: ["search-index"],
    queryFn: async () => {
        const res = await fetch(dataUrl("data/search.json"));
        if (!res.ok) {
            throw new Error(`data/search.json: ${res.status} ${res.statusText}`);
        }
        return loadIndex(await res.text());
    },
    staleTime: Infinity,
});
