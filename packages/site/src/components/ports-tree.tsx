import {useSuspenseQuery} from "@tanstack/react-query";
import {Link} from "@tanstack/react-router";
import {CATEGORIES, type Category} from "@termicolor/build";
import {ChevronRightIcon} from "lucide-react";
import {useMemo} from "react";

import {PortLink} from "@/components/port-link";
import {Collapsible, CollapsibleContent, CollapsibleTrigger} from "@/components/ui/collapsible";
import {type RegistryEntry, registryQuery} from "@/lib/registry";

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

// DESIGN.md §6: the current page gets an accent indicator, not a shade.
const treeLink =
    "text-muted-foreground hover:text-foreground hover:bg-hover -ml-px block border-l py-1 pr-2 pl-3 text-xs data-[status=active]:border-primary-text data-[status=active]:text-foreground data-[status=active]:font-medium";

/** Category tree of ports. `onNavigate` lets the mobile sheet close itself. */
export function PortsTree({onNavigate}: {onNavigate?: () => void}) {
    const {data: registry} = useSuspenseQuery(registryQuery);
    const groups = useMemo(() => groupPorts(registry), [registry]);
    return (
        <nav className="flex flex-col gap-1" aria-label="Ports">
            <Link
                to="/ports"
                onClick={onNavigate}
                activeOptions={{exact: true, includeSearch: false}}
                className="hover:bg-hover data-[status=active]:text-primary-text px-2 py-1 font-mono text-xs font-bold tracking-widest uppercase"
            >
                All ports
            </Link>
            {groups.map((g) => (
                <Collapsible key={g.category} defaultOpen={g.available.length > 0}>
                    <CollapsibleTrigger className="group hover:bg-hover flex w-full items-center gap-1 px-2 py-1 text-left font-mono text-xs">
                        <ChevronRightIcon className="size-3 transition-transform group-data-[panel-open]:rotate-90" />
                        <span className="flex-1">{CATEGORIES[g.category]}</span>
                        <span className="text-muted-foreground">{g.available.length}</span>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="ml-3.5 flex flex-col border-l">
                        {g.available.map((e) => (
                            <PortLink key={e.id} portId={e.id} onClick={onNavigate} className={treeLink}>
                                {e.name}
                            </PortLink>
                        ))}
                        {g.planned > 0 && (
                            <Link
                                to="/ports"
                                search={{category: g.category, status: "planned"}}
                                onClick={onNavigate}
                                className="text-muted-foreground hover:text-foreground py-1 pl-3 text-xs italic"
                            >
                                +{g.planned} planned
                            </Link>
                        )}
                    </CollapsibleContent>
                </Collapsible>
            ))}
        </nav>
    );
}
