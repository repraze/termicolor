import {queryOptions, useSuspenseQuery} from "@tanstack/react-query";
import {createFileRoute} from "@tanstack/react-router";

import {PortHeader, PortInstall} from "@/components/port-header";
import {type GalleryFilter, WallpaperGallery} from "@/components/wallpaper-gallery";
import {useTheme} from "@/hooks/use-theme";
import {dataUrl, registryQuery} from "@/lib/registry";
import {MODES, type Orientation, ORIENTATIONS, type WallpaperCatalog, type WallpaperMode} from "@/lib/wallpapers";

const catalogQuery = queryOptions({
    queryKey: ["wallpaper-catalog"],
    queryFn: async () => {
        const res = await fetch(dataUrl("ports/wallpapers/dist/catalog.json"));
        if (!res.ok) {
            throw new Error(`catalog.json: ${res.status} ${res.statusText}`);
        }
        return res.json() as Promise<WallpaperCatalog>;
    },
    staleTime: Infinity,
});

type Search = {family?: string; mode?: WallpaperMode; orientation?: Orientation};

/** More specific than /ports/$portId: the wallpapers port gets a gallery instead of a file viewer. */
export const Route = createFileRoute("/ports/wallpapers")({
    validateSearch: (search: Record<string, unknown>): Search => ({
        family: typeof search.family === "string" && search.family ? search.family : undefined,
        mode: MODES.includes(search.mode as WallpaperMode) ? (search.mode as WallpaperMode) : undefined,
        orientation: ORIENTATIONS.includes(search.orientation as Orientation)
            ? (search.orientation as Orientation)
            : undefined,
    }),
    loader: ({context}) =>
        Promise.all([
            context.queryClient.ensureQueryData(registryQuery),
            context.queryClient.ensureQueryData(catalogQuery),
        ]),
    component: WallpapersPage,
});

function WallpapersPage() {
    const {data: registry} = useSuspenseQuery(registryQuery);
    const {data: catalog} = useSuspenseQuery(catalogQuery);
    const search = Route.useSearch();
    const navigate = Route.useNavigate();
    const {resolved} = useTheme();
    const entry = registry.find((e) => e.id === "wallpapers");
    if (!entry || entry.status !== "available") {
        return null;
    }
    // mode follows the site theme until picked explicitly
    const filter: GalleryFilter = {
        family: search.family,
        mode: search.mode ?? resolved,
        orientation: search.orientation ?? "landscape",
    };
    return (
        <div className="flex flex-col gap-8">
            <PortHeader entry={entry} />
            <PortInstall entry={entry} />
            <WallpaperGallery
                catalog={catalog}
                filter={filter}
                onFilterChange={(next) =>
                    navigate({
                        search: {
                            family: next.family,
                            mode: next.mode === resolved ? undefined : next.mode,
                            orientation: next.orientation === "landscape" ? undefined : next.orientation,
                        },
                        replace: true,
                    })
                }
            />
        </div>
    );
}
