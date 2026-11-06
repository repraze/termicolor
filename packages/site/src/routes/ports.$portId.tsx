import {useClipboard} from "@mantine/hooks";
import {keepPreviousData, useQuery, useSuspenseQuery} from "@tanstack/react-query";
import {createFileRoute, Link, notFound} from "@tanstack/react-router";
import {type AccentName, ACCENTS} from "@termicolor/palette";
import {ArrowLeftIcon, CheckIcon, CopyIcon, DownloadIcon} from "lucide-react";
import {useState} from "react";

import {CodeBlock} from "@/components/code-block";
import {PortHeader, PortInstall} from "@/components/port-header";
import {Button} from "@/components/ui/button";
import {Tabs, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {ToggleGroup, ToggleGroupItem} from "@/components/ui/toggle-group";
import {useSearchUpdate} from "@/hooks/use-search-update";
import {useTheme} from "@/hooks/use-theme";
import {langFor} from "@/lib/highlight";
import {portBuildQuery, usesAccentQuery} from "@/lib/port-build";
import {saveBlob} from "@/lib/rasterize";
import {registryQuery} from "@/lib/registry";

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
        <div className="flex flex-col items-start gap-4">
            <p className="text-sm">That port isn't available yet.</p>
            <Button variant="outline" render={<Link to="/ports" />}>
                <ArrowLeftIcon /> All ports
            </Button>
        </div>
    ),
});

function PortPage() {
    const {portId} = Route.useParams();
    const {data: registry} = useSuspenseQuery(registryQuery);
    const entry = registry.find((e) => e.id === portId);
    if (!entry || entry.status !== "available") {
        return null;
    }
    return (
        <div className="flex flex-col gap-8">
            <PortHeader entry={entry} />
            <PortInstall entry={entry} />

            <FileViewer portId={entry.id} />
        </div>
    );
}

/**
 * Files of a port, built in the browser for the chosen accent (DESIGN.md §2). The default accent's
 * output is byte-identical to the committed dist (port-build.test.ts).
 */
function FileViewer({portId}: {portId: string}) {
    const search = Route.useSearch();
    const updateSearch = useSearchUpdate<{accent?: AccentName}>();
    const theme = useTheme();
    const accent = search.accent ?? theme.accent;
    const {data: accentDriven} = useQuery(usesAccentQuery(portId));
    const {data: files, error} = useQuery({...portBuildQuery(portId, accent), placeholderData: keepPreviousData});
    const [activePath, setActive] = useState<string>();
    const active = files?.find((f) => f.path === activePath) ?? files?.[0];
    const clipboard = useClipboard({timeout: 1500});

    return (
        <section className="flex flex-col gap-3" data-testid="port-files">
            <div className="flex flex-wrap items-end justify-between gap-3">
                <h2 className="text-lg font-bold">Files</h2>
                {accentDriven && (
                    <AccentPicker
                        value={accent}
                        onChange={(next) => updateSearch({accent: next === theme.accent ? undefined : next})}
                    />
                )}
            </div>
            {files && (
                <Tabs value={active?.path} onValueChange={(value: string) => setActive(value)}>
                    <TabsList className="flex-wrap">
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
