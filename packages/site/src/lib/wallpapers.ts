/** Pure helpers over ports/wallpapers/dist/catalog.json, shared by the gallery page and the thumbnail script. */

export type WallpaperMode = "dark" | "light";
export type Orientation = "landscape" | "portrait";
export type Size = {width: number; height: number};

export type WallpaperEntry = {
    id: string;
    generator: string;
    name: string;
    family: string;
    seed: number;
    params: Record<string, unknown>;
    /** `<mode>/<W>x<H>/<id>.svg`, relative to the port's dist/. */
    files: string[];
};

export type WallpaperCatalog = {
    families: Record<string, string>;
    sizes: Record<string, Size>;
    wallpapers: WallpaperEntry[];
};

export type WallpaperFile = {
    path: string;
    mode: WallpaperMode;
    width: number;
    height: number;
    orientation: Orientation;
    /** 1080p, QHD, 4K (by the short side). */
    label: string;
};

export const MODES: readonly WallpaperMode[] = ["dark", "light"];
export const ORIENTATIONS: readonly Orientation[] = ["landscape", "portrait"];

/** Thumbnail box per orientation, rendered at build time by scripts/thumbnails.ts. */
export const THUMB_SIZES: Record<Orientation, Size> = {
    landscape: {width: 480, height: 270},
    portrait: {width: 270, height: 480},
};
export const THUMB_EXT = "webp";

const SHORT_SIDE_LABELS: Record<number, string> = {1080: "1080p", 1440: "QHD", 2160: "4K"};

export function orientationOf({width, height}: Size): Orientation {
    return height > width ? "portrait" : "landscape";
}

export function sizeLabel(size: Size): string {
    const short = Math.min(size.width, size.height);
    return SHORT_SIDE_LABELS[short] ?? `${size.width}x${size.height}`;
}

const FILE_RE = /^(dark|light)\/(\d+)x(\d+)\/[^/]+\.svg$/;

/** Parses `dark/1920x1080/flow-2.svg`; undefined for anything else. */
export function parseFile(path: string): WallpaperFile | undefined {
    const match = FILE_RE.exec(path);
    if (!match) {
        return undefined;
    }
    const size = {width: Number(match[2]), height: Number(match[3])};
    return {
        path,
        mode: match[1] as WallpaperMode,
        ...size,
        orientation: orientationOf(size),
        label: sizeLabel(size),
    };
}

/** The entry's files for one mode and orientation, smallest first. */
export function filesFor(entry: WallpaperEntry, mode: WallpaperMode, orientation: Orientation): WallpaperFile[] {
    return entry.files
        .map(parseFile)
        .filter((f): f is WallpaperFile => !!f && f.mode === mode && f.orientation === orientation)
        .sort((a, b) => a.width * a.height - b.width * b.height);
}

/** Where the thumbnail of an entry lives, relative to the port's folder in public/ports/wallpapers. */
export function thumbPath(id: string, mode: WallpaperMode, orientation: Orientation): string {
    return `thumbs/${mode}/${orientation}/${id}.${THUMB_EXT}`;
}

export type WallpaperFilter = {family?: string; mode: WallpaperMode; orientation: Orientation};

/** Entries matching the family filter (all when unset) that have files in the chosen mode and orientation. */
export function filterWallpapers(entries: WallpaperEntry[], filter: WallpaperFilter): WallpaperEntry[] {
    return entries.filter(
        (e) =>
            (!filter.family || e.family === filter.family) && filesFor(e, filter.mode, filter.orientation).length > 0,
    );
}

/** Entry count per family, in the catalog's family order. */
export function countByFamily(catalog: WallpaperCatalog): {family: string; label: string; count: number}[] {
    return Object.entries(catalog.families).map(([family, label]) => ({
        family,
        label,
        count: catalog.wallpapers.filter((e) => e.family === family).length,
    }));
}
