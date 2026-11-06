import {queryOptions} from "@tanstack/react-query";
import type {PortDefinition, PortFile} from "@termicolor/build";
import {type AccentName, createPalette, DEFAULT_ACCENT} from "@termicolor/palette";

/**
 * Every port's build function, lazy-loaded (one chunk per port). Ports are pure `(palette) => files`,
 * so the site renders any accent variant in the browser instead of the repo committing 8 copies.
 * Wallpapers aren't here: they pick their own seeded accents, independent of the theme accent.
 */
const LOADERS = import.meta.glob<{default: PortDefinition}>([
    "../../../../ports/*/port.ts",
    "!../../../../ports/wallpapers/port.ts",
]);

const byId = Object.fromEntries(
    Object.entries(LOADERS).map(([path, load]) => [path.split("/").at(-2)!, load] as const),
);

export const buildablePorts = Object.keys(byId);

const palettes = new Map<AccentName, ReturnType<typeof createPalette>>();
function paletteFor(accent: AccentName) {
    let p = palettes.get(accent);
    if (!p) {
        p = createPalette({accent});
        palettes.set(accent, p);
    }
    return p;
}

export async function buildPort(portId: string, accent: AccentName): Promise<PortFile[]> {
    const load = byId[portId];
    if (!load) {
        throw new Error(`No buildable port "${portId}"`);
    }
    return (await load()).default.build(paletteFor(accent));
}

/** Whether a port's output depends on the accent at all (some only use fixed roles). */
export async function usesAccent(portId: string): Promise<boolean> {
    const [base, other] = await Promise.all([
        buildPort(portId, DEFAULT_ACCENT),
        buildPort(portId, DEFAULT_ACCENT === "blue" ? "green" : "blue"),
    ]);
    return base.some((f, i) => f.contents !== other[i]?.contents);
}

export const portBuildQuery = (portId: string, accent: AccentName) =>
    queryOptions({
        queryKey: ["port-build", portId, accent],
        queryFn: () => buildPort(portId, accent),
        staleTime: Infinity,
        enabled: portId in byId,
    });

export const usesAccentQuery = (portId: string) =>
    queryOptions({
        queryKey: ["port-uses-accent", portId],
        queryFn: () => usesAccent(portId),
        staleTime: Infinity,
        enabled: portId in byId,
    });
