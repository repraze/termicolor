import {SiteAside, SiteMain} from "@repraze/kernelkit/components/site-layout";
import {useTheme} from "@repraze/kernelkit/provider";
import {usePageTitle} from "@repraze/kernelkit/site";
import {useSuspenseQuery} from "@tanstack/react-query";
import {createFileRoute} from "@tanstack/react-router";

import {PageToc} from "@/components/page-toc";
import {PortHeader, PortInstall} from "@/components/port-header";
import {PortPager} from "@/components/port-pager";
import {type GalleryFilter, WallpaperGallery} from "@/components/wallpaper-gallery";
import {useSearchUpdate} from "@/hooks/use-search-update";
import {registryQuery} from "@/lib/registry";
import {SITE_NAME} from "@/lib/site";
import {catalogQuery} from "@/lib/wallpaper-catalog";
import {MODES, type Orientation, ORIENTATIONS, type WallpaperMode} from "@/lib/wallpapers";

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
    usePageTitle("Wallpapers", SITE_NAME);
    const {data: registry} = useSuspenseQuery(registryQuery);
    const {data: catalog} = useSuspenseQuery(catalogQuery);
    const search = Route.useSearch();
    const updateSearch = useSearchUpdate();
    const {resolvedMode: resolved} = useTheme();
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
        <>
            <SiteMain>
                <PortHeader entry={entry} />
                <PortInstall entry={entry} />
                <WallpaperGallery
                    catalog={catalog}
                    filter={filter}
                    onFilterChange={(next) =>
                        updateSearch({
                            family: next.family,
                            mode: next.mode === resolved ? undefined : next.mode,
                            orientation: next.orientation === "landscape" ? undefined : next.orientation,
                        })
                    }
                />
                <PortPager portId={entry.id} />
            </SiteMain>
            <SiteAside>
                <PageToc
                    sections={[
                        {id: "install", title: "Install"},
                        {id: "gallery", title: "Gallery"},
                    ]}
                />
            </SiteAside>
        </>
    );
}
