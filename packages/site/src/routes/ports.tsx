import {useSuspenseQuery} from "@tanstack/react-query";
import {createFileRoute, Link, Outlet} from "@tanstack/react-router";
import {CATEGORIES, type Category} from "@termicolor/build";
import {ChevronRightIcon} from "lucide-react";
import {useMemo} from "react";

import {Collapsible, CollapsibleContent, CollapsibleTrigger} from "@/components/ui/collapsible";
import {type RegistryEntry, registryQuery} from "@/lib/registry";

export const Route = createFileRoute("/ports")({
    loader: ({context}) => context.queryClient.ensureQueryData(registryQuery),
    component: PortsLayout,
});

/** Ports grouped by category in CATEGORIES order; available first within a group. */
export function groupPorts(registry: RegistryEntry[]) {
    return (Object.keys(CATEGORIES) as Category[])
        .map((category) => {
            const entries = registry.filter((e) => e.category === category);
            return {
                category,
                available: entries.filter((e) => e.status === "available").sort((a, b) => a.name.localeCompare(b.name)),
                planned: entries.filter((e) => e.status === "planned").length,
            };
        })
        .filter((g) => g.available.length || g.planned);
}

const treeLink =
    "text-muted-foreground hover:text-foreground hover:bg-muted -ml-px block border-l py-1 pr-2 pl-3 text-xs data-[status=active]:border-primary data-[status=active]:text-foreground data-[status=active]:font-medium";

function PortsLayout() {
    const {data: registry} = useSuspenseQuery(registryQuery);
    const groups = useMemo(() => groupPorts(registry), [registry]);
    return (
        <div className="flex flex-col gap-8 md:flex-row">
            <aside className="md:w-52 md:shrink-0" aria-label="Ports">
                <nav className="md:sticky md:top-6 flex flex-col gap-1">
                    <Link
                        to="/ports"
                        activeOptions={{exact: true, includeSearch: false}}
                        className="hover:bg-muted data-[status=active]:text-primary px-2 py-1 font-mono text-xs font-bold tracking-widest uppercase"
                    >
                        All ports
                    </Link>
                    {groups.map((g) => (
                        <Collapsible key={g.category} defaultOpen={g.available.length > 0}>
                            <CollapsibleTrigger className="group hover:bg-muted flex w-full items-center gap-1 px-2 py-1 text-left font-mono text-xs">
                                <ChevronRightIcon className="size-3 transition-transform group-data-[panel-open]:rotate-90" />
                                <span className="flex-1">{CATEGORIES[g.category]}</span>
                                <span className="text-muted-foreground">{g.available.length}</span>
                            </CollapsibleTrigger>
                            <CollapsibleContent className="ml-3.5 flex flex-col border-l">
                                {g.available.map((e) => (
                                    <Link key={e.id} to="/ports/$portId" params={{portId: e.id}} className={treeLink}>
                                        {e.name}
                                    </Link>
                                ))}
                                {g.planned > 0 && (
                                    <Link
                                        to="/ports"
                                        search={{category: g.category, status: "planned"}}
                                        className="text-muted-foreground hover:text-foreground py-1 pl-3 text-xs italic"
                                    >
                                        +{g.planned} planned
                                    </Link>
                                )}
                            </CollapsibleContent>
                        </Collapsible>
                    ))}
                </nav>
            </aside>
            <div className="min-w-0 flex-1">
                <Outlet />
            </div>
        </div>
    );
}
