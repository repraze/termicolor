import {useLocalStorage} from "@mantine/hooks";
import {Badge} from "@repraze/kernelkit/components/badge";
import {buttonVariants} from "@repraze/kernelkit/components/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@repraze/kernelkit/components/dialog";
import {ToggleGroup, ToggleGroupItem} from "@repraze/kernelkit/components/toggle-group";
import {DownloadIcon, ExpandIcon, LoaderIcon} from "lucide-react";
import {createContext, useContext, useMemo, useState} from "react";

import {clickable} from "@/lib/interactive";
import {type RasterFormat, rasterize, saveBlob} from "@/lib/rasterize";
import {dataUrl} from "@/lib/registry";
import {cn} from "@/lib/utils";
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

/** JPG by default: what Windows, macOS and most Linux desktops take as a wallpaper. */
export type DownloadFormat = RasterFormat | "svg";
const FormatContext = createContext<DownloadFormat>("jpg");

const downloadName = (entry: WallpaperEntry, file: WallpaperFile, format: DownloadFormat) =>
    `termicolor-${entry.id}-${file.mode}-${file.width}x${file.height}.${format}`;

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
    const format = useContext(FormatContext);
    return (
        <div className="flex flex-wrap gap-1">
            {files.map((file) =>
                format === "svg" ? (
                    // a plain <a>: Base UI's Button would give it role="button", and these are file links
                    <a
                        key={file.path}
                        href={dataUrl(`${BASE}/dist/${file.path}`)}
                        download={downloadName(entry, file, "svg")}
                        className={buttonVariants({variant: "outline", size: "xs"})}
                        title={`${file.width}×${file.height} SVG`}
                        aria-label={`Download ${entry.id} ${file.mode} ${file.label} (${file.width}×${file.height}) SVG`}
                    >
                        <DownloadIcon /> {file.label}
                    </a>
                ) : (
                    <RasterDownload key={file.path} entry={entry} file={file} format={format} />
                ),
            )}
        </div>
    );
}

/** Rasterizes the SVG at full size in the browser, then saves it. */
function RasterDownload({entry, file, format}: {entry: WallpaperEntry; file: WallpaperFile; format: RasterFormat}) {
    const [busy, setBusy] = useState(false);
    const label = `Download ${entry.id} ${file.mode} ${file.label} (${file.width}×${file.height}) ${format.toUpperCase()}`;
    return (
        <button
            type="button"
            className={buttonVariants({variant: "outline", size: "xs"})}
            title={`${file.width}×${file.height} ${format.toUpperCase()}`}
            aria-label={label}
            aria-busy={busy}
            disabled={busy}
            onClick={async () => {
                setBusy(true);
                try {
                    const blob = await rasterize(dataUrl(`${BASE}/dist/${file.path}`), file.width, file.height, format);
                    saveBlob(blob, downloadName(entry, file, format));
                } finally {
                    setBusy(false);
                }
            }}
        >
            {busy ? <LoaderIcon className="animate-spin" /> : <DownloadIcon />} {file.label}
        </button>
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
        <li className={cn("bg-card flex flex-col border", clickable.surface)} data-testid="wallpaper-card">
            <button
                type="button"
                onClick={onOpen}
                className="relative block cursor-zoom-in overflow-hidden border-b outline-none"
                aria-label={`Preview ${entry.name} ${entry.seed}`}
            >
                <span
                    className={cn(
                        "bg-primary text-primary-foreground absolute top-2 right-2 z-10 flex items-center gap-1 px-1.5 py-0.5 font-mono text-xs",
                        clickable.reveal,
                    )}
                    aria-hidden
                >
                    <ExpandIcon className="size-3" /> preview
                </span>
                <img
                    src={dataUrl(`${BASE}/${thumbPath(entry.id, filter.mode, filter.orientation)}`)}
                    alt=""
                    width={thumb.width}
                    height={thumb.height}
                    loading="lazy"
                    decoding="async"
                    className="block h-auto w-full transition-transform group-hover/click:scale-[1.03]"
                    style={{aspectRatio: `${thumb.width} / ${thumb.height}`}}
                />
            </button>
            <div className="flex flex-col gap-2 p-2">
                <div className="flex items-center justify-between gap-2">
                    <span className={cn("truncate text-sm font-medium", clickable.title)}>
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
    const [format, setFormat] = useLocalStorage<DownloadFormat>({
        key: "termicolor-wallpaper-format",
        defaultValue: "jpg",
        getInitialValueInEffect: false,
    });
    const family = filter.family && filter.family in catalog.families ? filter.family : undefined;
    const results = useMemo(
        () => filterWallpapers(catalog.wallpapers, {...filter, family}),
        [catalog.wallpapers, filter, family],
    );
    const preview = results.find((e) => e.id === previewId);
    const portrait = filter.orientation === "portrait";

    return (
        <FormatContext value={format}>
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
                    <FilterGroup
                        label="Download as"
                        value={format}
                        options={[
                            {value: "jpg", label: "JPG"},
                            {value: "png", label: "PNG"},
                            {value: "svg", label: "SVG"},
                        ]}
                        onChange={(value) => setFormat(value as DownloadFormat)}
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
        </FormatContext>
    );
}
