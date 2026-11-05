import {useClipboard} from "@mantine/hooks";
import {useQuery, useSuspenseQuery} from "@tanstack/react-query";
import {createFileRoute, Link, notFound} from "@tanstack/react-router";
import {CATEGORIES} from "@termicolor/build";
import {ArrowLeftIcon, CheckIcon, CopyIcon, DownloadIcon, ExternalLinkIcon} from "lucide-react";
import {useState} from "react";

import {Markdown} from "@/components/markdown";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Tabs, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {dataUrl, portFileQuery, registryQuery} from "@/lib/registry";

export const Route = createFileRoute("/ports/$portId")({
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
            <Button variant="outline" render={<Link to="/" />}>
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
            <div className="flex flex-col gap-3">
                <Link to="/" className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-xs">
                    <ArrowLeftIcon className="size-3" /> All ports
                </Link>
                <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-2xl font-bold">{entry.name}</h1>
                    <Badge variant="outline">{CATEGORIES[entry.category]}</Badge>
                </div>
                <p className="text-muted-foreground text-sm">{entry.description}</p>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" render={<a href={entry.source} />}>
                        Source <ExternalLinkIcon />
                    </Button>
                    {entry.homepage && (
                        <Button variant="ghost" size="sm" render={<a href={entry.homepage} />}>
                            {new URL(entry.homepage).hostname} <ExternalLinkIcon />
                        </Button>
                    )}
                </div>
            </div>

            <section className="flex flex-col gap-3">
                <h2 className="text-lg font-bold">Install</h2>
                <Markdown source={entry.install} />
            </section>

            <FileViewer portId={entry.id} files={entry.files} />
        </div>
    );
}

function FileViewer({portId, files}: {portId: string; files: string[]}) {
    const [active, setActive] = useState(files[0]!);
    const {data, isPending, error} = useQuery(portFileQuery(portId, active));
    const clipboard = useClipboard({timeout: 1500});
    const href = dataUrl(`ports/${portId}/dist/${active}`);

    return (
        <section className="flex flex-col gap-3">
            <h2 className="text-lg font-bold">Files</h2>
            <Tabs value={active} onValueChange={(value: string) => setActive(value)}>
                <TabsList className="flex-wrap">
                    {files.map((file) => (
                        <TabsTrigger key={file} value={file}>
                            {file}
                        </TabsTrigger>
                    ))}
                </TabsList>
            </Tabs>
            <div className="bg-card border">
                <div className="flex items-center justify-end gap-1 border-b p-1">
                    <Button variant="ghost" size="sm" disabled={!data} onClick={() => data && clipboard.copy(data)}>
                        {clipboard.copied ? <CheckIcon /> : <CopyIcon />} {clipboard.copied ? "Copied" : "Copy"}
                    </Button>
                    <Button variant="ghost" size="sm" render={<a href={href} download={active.split("/").pop()} />}>
                        <DownloadIcon /> Download
                    </Button>
                </div>
                <pre className="max-h-[32rem] overflow-auto p-3 text-xs">
                    {isPending ? "Loading…" : error ? `Failed to load: ${error.message}` : data}
                </pre>
            </div>
        </section>
    );
}
