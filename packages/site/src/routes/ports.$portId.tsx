import {useClipboard} from "@mantine/hooks";
import {Button} from "@repraze/kernelkit/components/button";
import {SiteAside, SiteMain} from "@repraze/kernelkit/components/site-layout";
import {Tabs, TabsList, TabsTrigger} from "@repraze/kernelkit/components/tabs";
import {ToggleGroup, ToggleGroupItem} from "@repraze/kernelkit/components/toggle-group";
import {type AccentName, ACCENTS} from "@repraze/termicolor";
import {keepPreviousData, useQuery, useSuspenseQuery} from "@tanstack/react-query";
import {createFileRoute, Link, notFound} from "@tanstack/react-router";
import {ArrowLeftIcon, CheckIcon, CopyIcon, DownloadIcon} from "lucide-react";
import {useState} from "react";

import {CodeBlock} from "@/components/code-block";
import {PageToc} from "@/components/page-toc";
import {PortHeader, PortInstall} from "@/components/port-header";
import {PortPager} from "@/components/port-pager";
import {useSearchUpdate} from "@/hooks/use-search-update";
import {usePortAccent} from "@/hooks/use-theme";
import {langFor} from "@/lib/highlight";
import {portBuildQuery, usesAccentQuery} from "@/lib/port-build";
import {saveBlob} from "@/lib/rasterize";
import {registryQuery} from "@/lib/registry";
import {usePageTitle} from "@/lib/site";

export const Route = createFileRoute("/ports/$portId")({
    validateSearch: (search: Record<string, unknown>): {accent?: AccentName} => ({
        accent: ACCENTS.includes(search.accent as AccentName) ? (search.accent as AccentName) : undefined,
    }),
    loader: async ({context, params}) => {
        const registry = await context.queryClient.ensureQueryData(registryQuery);
        const entry = registry.find((e) => e.id === params.portId);
        if (!entry || entry.status !== "available") {
            throw notFound();
        }
    },
    component: PortPage,
    notFoundComponent: () => (
        <SiteMain className="items-start gap-4">
            <p className="text-sm">That port isn't available yet.</p>
            <Button variant="outline" render={<Link to="/ports" />}>
                <ArrowLeftIcon /> All ports
            </Button>
        </SiteMain>
    ),
});

function PortPage() {
    const {portId} = Route.useParams();
    const {data: registry} = useSuspenseQuery(registryQuery);
    const entry = registry.find((e) => e.id === portId);
    usePageTitle(entry?.name);
    if (!entry || entry.status !== "available") {
        return null;
    }
    return (
        <>
            <SiteMain>
                <PortHeader entry={entry} />
                <PortInstall entry={entry} />
                <FileViewer portId={entry.id} />
                <PortPager portId={entry.id} />
            </SiteMain>
            <SiteAside>
                <PageToc
                    sections={[
                        {id: "install", title: "Install"},
                        {id: "files", title: "Files"},
                    ]}
                />
            </SiteAside>
        </>
    );
}

/**
 * Files of a port, built in the browser for the chosen accent (DESIGN.md §2). The default accent's
 * output is byte-identical to the committed dist (port-build.test.ts).
 */
function FileViewer({portId}: {portId: string}) {
    const search = Route.useSearch();
    const updateSearch = useSearchUpdate<{accent?: AccentName}>();
    const [portAccent, setPortAccent] = usePortAccent();
    // a shared link's ?accent= wins; picking one makes it the sticky choice and drops the param
    const accent = search.accent ?? portAccent;
    const {data: accentDriven} = useQuery(usesAccentQuery(portId));
    const {data: files, error} = useQuery({...portBuildQuery(portId, accent), placeholderData: keepPreviousData});
    const [activePath, setActive] = useState<string>();
    const active = files?.find((f) => f.path === activePath) ?? files?.[0];
    const clipboard = useClipboard({timeout: 1500});

    return (
        <section id="files" className="flex scroll-mt-24 flex-col gap-3" data-testid="port-files">
            <div className="flex flex-wrap items-end justify-between gap-3">
                <h2 className="font-heading text-xl font-semibold">Files</h2>
                {accentDriven && (
                    <AccentPicker
                        value={accent}
                        onChange={(next) => {
                            setPortAccent(next);
                            if (search.accent) {
                                updateSearch({accent: undefined});
                            }
                        }}
                    />
                )}
            </div>
            {files && (
                <Tabs value={active?.path} onValueChange={(value: string) => setActive(value)}>
                    <TabsList variant="line" className="flex-wrap">
                        {files.map((file) => (
                            <TabsTrigger key={file.path} value={file.path}>
                                {file.path}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </Tabs>
            )}
            <div className="bg-card border">
                <div className="flex items-center justify-end gap-1 border-b p-1">
                    {accentDriven && (
                        <span className="text-muted-foreground mr-auto pl-2 font-mono text-xs">accent: {accent}</span>
                    )}
                    <Button
                        variant="ghost"
                        size="sm"
                        disabled={!active}
                        onClick={() => active && clipboard.copy(active.contents)}
                    >
                        {clipboard.copied ? <CheckIcon /> : <CopyIcon />} {clipboard.copied ? "Copied" : "Copy"}
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        disabled={!active}
                        onClick={() =>
                            active &&
                            saveBlob(new Blob([active.contents], {type: "text/plain"}), active.path.split("/").pop()!)
                        }
                    >
                        <DownloadIcon /> Download
                    </Button>
                </div>
                {active ? (
                    <CodeBlock code={active.contents} lang={langFor(active.path)} size="tall" className="border-0" />
                ) : (
                    <pre className="p-3 text-xs">{error ? `Failed to build: ${error.message}` : "Building…"}</pre>
                )}
            </div>
        </section>
    );
}

function AccentPicker({value, onChange}: {value: AccentName; onChange: (accent: AccentName) => void}) {
    return (
        <div className="flex flex-col gap-1">
            <span className="text-muted-foreground font-mono text-xs tracking-widest uppercase">Accent</span>
            <ToggleGroup
                aria-label="Accent"
                value={[value]}
                onValueChange={(next: string[]) => next[0] && onChange(next[0] as AccentName)}
                variant="outline"
                size="sm"
                spacing={0}
                className="flex-wrap"
            >
                {ACCENTS.map((name) => (
                    <ToggleGroupItem key={name} value={name} aria-label={name} title={name} className="capitalize">
                        <span className="size-3 border" style={{background: `var(--tc-${name}-fill)`}} />
                        <span className="hidden sm:inline">{name}</span>
                    </ToggleGroupItem>
                ))}
            </ToggleGroup>
        </div>
    );
}
