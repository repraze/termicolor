import {DownloadIcon} from "lucide-react";
import {useMemo, useState} from "react";

import {Badge} from "@/components/ui/badge";
import {buttonVariants} from "@/components/ui/button";
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {ToggleGroup, ToggleGroupItem} from "@/components/ui/toggle-group";
import {dataUrl} from "@/lib/registry";
import {
    filesFor,
    filterWallpapers,
    type Orientation,
    THUMB_SIZES,
    thumbPath,
    type WallpaperCatalog,
    type WallpaperEntry,
    type WallpaperFile,
    type WallpaperMode,
} from "@/lib/wallpapers";

const BASE = "ports/wallpapers";

export type GalleryFilter = {family?: string; mode: WallpaperMode; orientation: Orientation};

const downloadName = (entry: WallpaperEntry, file: WallpaperFile) =>
    `termicolor-${entry.id}-${file.mode}-${file.width}x${file.height}.svg`;

function FilterGroup({
    label,
    value,
    options,
    onChange,
}: {
    label: string;
    value: string;
    options: {value: string; label: string}[];
    onChange: (value: string) => void;
}) {
    return (
        <div className="flex flex-col gap-1">
            <span className="text-muted-foreground font-mono text-xs tracking-widest uppercase">{label}</span>
            <ToggleGroup
                aria-label={label}
                value={[value]}
                // single select that can't be cleared: ignore the deselect of the pressed item
                onValueChange={(next: string[]) => next[0] && onChange(next[0])}
                variant="outline"
                size="sm"
                spacing={0}
                className="flex-wrap"
            >
                {options.map((o) => (
                    <ToggleGroupItem key={o.value} value={o.value}>
                        {o.label}
                    </ToggleGroupItem>
                ))}
            </ToggleGroup>
        </div>
    );
}

function DownloadLinks({entry, files}: {entry: WallpaperEntry; files: WallpaperFile[]}) {
    return (
        <div className="flex flex-wrap gap-1">
            {files.map((file) => (
                // a plain <a>: Base UI's Button would give it role="button", and these are file links
                <a
                    key={file.path}
                    href={dataUrl(`${BASE}/dist/${file.path}`)}
                    download={downloadName(entry, file)}
                    className={buttonVariants({variant: "outline", size: "xs"})}
                    title={`${file.width}×${file.height} SVG`}
                    aria-label={`Download ${entry.id} ${file.mode} ${file.label} (${file.width}×${file.height}) SVG`}
                >
                    <DownloadIcon /> {file.label}
                </a>
            ))}
        </div>
    );
}

function WallpaperCard({
    entry,
    familyLabel,
    filter,
    onOpen,
}: {
    entry: WallpaperEntry;
    familyLabel: string;
    filter: GalleryFilter;
    onOpen: () => void;
}) {
    const files = filesFor(entry, filter.mode, filter.orientation);
    const thumb = THUMB_SIZES[filter.orientation];
    return (
        <li className="bg-card flex flex-col border" data-testid="wallpaper-card">
            <button
                type="button"
                onClick={onOpen}
                className="focus-visible:ring-ring/50 group block overflow-hidden border-b outline-none focus-visible:ring-[3px]"
                aria-label={`Preview ${entry.name} ${entry.seed}`}
            >
                <img
                    src={dataUrl(`${BASE}/${thumbPath(entry.id, filter.mode, filter.orientation)}`)}
                    alt=""
                    width={thumb.width}
                    height={thumb.height}
                    loading="lazy"
                    decoding="async"
                    className="block h-auto w-full transition-transform group-hover:scale-[1.02]"
                    style={{aspectRatio: `${thumb.width} / ${thumb.height}`}}
                />
            </button>
            <div className="flex flex-col gap-2 p-2">
                <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-medium">
                        {entry.name} <span className="text-muted-foreground font-mono text-xs">#{entry.seed}</span>
                    </span>
                    <Badge variant="outline">{familyLabel}</Badge>
                </div>
                <DownloadLinks entry={entry} files={files} />
            </div>
        </li>
    );
}

function Preview({
    entry,
    familyLabel,
    filter,
    onClose,
}: {
    entry: WallpaperEntry | undefined;
    familyLabel: string;
    filter: GalleryFilter;
    onClose: () => void;
}) {
    const files = entry ? filesFor(entry, filter.mode, filter.orientation) : [];
    const portrait = filter.orientation === "portrait";
    return (
        <Dialog open={!!entry} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className={portrait ? "sm:max-w-md" : "sm:max-w-5xl"}>
                {entry && files[0] && (
                    <>
                        <DialogHeader>
                            <DialogTitle>
                                {entry.name} <span className="font-mono">#{entry.seed}</span>
                            </DialogTitle>
                            <DialogDescription>
                                {familyLabel} · {filter.mode} · {filter.orientation} ·{" "}
                                <span className="font-mono">{entry.id}</span>
                            </DialogDescription>
                        </DialogHeader>
                        <img
                            src={dataUrl(`${BASE}/dist/${files[0].path}`)}
                            alt={`${entry.name} ${entry.seed}, ${filter.mode}, ${filter.orientation}`}
                            width={files[0].width}
                            height={files[0].height}
                            className="mx-auto block h-auto max-h-[70vh] w-auto max-w-full border"
                        />
                        <DownloadLinks entry={entry} files={files} />
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}

/** Thumbnail grid of the wallpapers port with family / mode / orientation filters and SVG downloads. */
export function WallpaperGallery({
    catalog,
    filter,
    onFilterChange,
}: {
    catalog: WallpaperCatalog;
    filter: GalleryFilter;
    onFilterChange: (next: GalleryFilter) => void;
}) {
    const [previewId, setPreviewId] = useState<string>();
    const family = filter.family && filter.family in catalog.families ? filter.family : undefined;
    const results = useMemo(
        () => filterWallpapers(catalog.wallpapers, {...filter, family}),
        [catalog.wallpapers, filter, family],
    );
    const preview = results.find((e) => e.id === previewId);
    const portrait = filter.orientation === "portrait";

    return (
        <section className="flex flex-col gap-4" aria-labelledby="gallery-heading">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 id="gallery-heading" className="text-lg font-bold">
                    Gallery
                </h2>
                <span className="text-muted-foreground font-mono text-xs">
                    {results.length} of {catalog.wallpapers.length}
                </span>
            </div>
            <div className="flex flex-wrap gap-4">
                <FilterGroup
                    label="Family"
                    value={family ?? "all"}
                    options={[
                        {value: "all", label: "All"},
                        ...Object.entries(catalog.families).map(([value, label]) => ({value, label})),
                    ]}
                    onChange={(value) => onFilterChange({...filter, family: value === "all" ? undefined : value})}
                />
                <FilterGroup
                    label="Mode"
                    value={filter.mode}
                    options={[
                        {value: "dark", label: "Dark"},
                        {value: "light", label: "Light"},
                    ]}
                    onChange={(value) => onFilterChange({...filter, mode: value as WallpaperMode})}
                />
                <FilterGroup
                    label="Orientation"
                    value={filter.orientation}
                    options={[
                        {value: "landscape", label: "Landscape"},
                        {value: "portrait", label: "Portrait"},
                    ]}
                    onChange={(value) => onFilterChange({...filter, orientation: value as Orientation})}
                />
            </div>
            <ul
                className={
                    portrait
                        ? "grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
                        : "grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3"
                }
            >
                {results.map((entry) => (
                    <WallpaperCard
                        key={entry.id}
                        entry={entry}
                        familyLabel={catalog.families[entry.family] ?? entry.family}
                        filter={filter}
                        onOpen={() => setPreviewId(entry.id)}
                    />
                ))}
            </ul>
            <Preview
                entry={preview}
                familyLabel={preview ? (catalog.families[preview.family] ?? preview.family) : ""}
                filter={filter}
                onClose={() => setPreviewId(undefined)}
            />
        </section>
    );
}
