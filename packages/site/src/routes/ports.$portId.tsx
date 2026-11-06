import {useClipboard} from "@mantine/hooks";
import {useQuery, useSuspenseQuery} from "@tanstack/react-query";
import {createFileRoute, Link, notFound} from "@tanstack/react-router";
import {ArrowLeftIcon, CheckIcon, CopyIcon, DownloadIcon} from "lucide-react";
import {useState} from "react";

import {CodeBlock} from "@/components/code-block";
import {PortHeader, PortInstall} from "@/components/port-header";
import {Button} from "@/components/ui/button";
import {Tabs, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {langFor} from "@/lib/highlight";
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
                {data !== undefined ? (
                    <CodeBlock code={data} lang={langFor(active)} size="tall" className="border-0" />
                ) : (
                    <pre className="p-3 text-xs">{isPending ? "Loading…" : `Failed to load: ${error?.message}`}</pre>
                )}
            </div>
        </section>
    );
}
