import {Collapsible, CollapsibleContent, CollapsibleTrigger} from "@repraze/kernelkit/components/collapsible";
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuBadge,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from "@repraze/kernelkit/components/sidebar";
import {useSuspenseQuery} from "@tanstack/react-query";
import {Link, useRouterState} from "@tanstack/react-router";
import {CATEGORIES, type Category} from "@termicolor/build";
import {ChevronRightIcon} from "lucide-react";
import {useMemo} from "react";

import {PortLink} from "@/components/port-link";
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

/**
 * Category tree of ports, on the suite's sidebar parts (same items as the kernelkit docs sidebar).
 * `onNavigate` lets the mobile sheet close itself.
 */
export function PortsTree({onNavigate}: {onNavigate?: () => void}) {
    const {data: registry} = useSuspenseQuery(registryQuery);
    const groups = useMemo(() => groupPorts(registry), [registry]);
    const pathname = useRouterState({select: (s) => s.location.pathname});
    const current = (portId: string) => pathname.endsWith(`/ports/${portId}`);
    return (
        <nav aria-label="Ports" className="flex flex-col">
            <SidebarGroup>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            isActive={/\/ports\/?$/.test(pathname)}
                            render={<Link to="/ports" onClick={onNavigate} />}
                        >
                            All ports
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarGroup>
            <SidebarGroup>
                <SidebarGroupLabel className="font-mono uppercase">Categories</SidebarGroupLabel>
                <SidebarMenu>
                    {groups.map((g) => (
                        <Collapsible
                            key={g.category}
                            defaultOpen={g.available.length > 0}
                            className="group/collapsible"
                            render={<SidebarMenuItem />}
                        >
                            <CollapsibleTrigger render={<SidebarMenuButton />}>
                                <ChevronRightIcon className="transition-transform group-data-open/collapsible:rotate-90" />
                                <span>{CATEGORIES[g.category]}</span>
                            </CollapsibleTrigger>
                            <SidebarMenuBadge className="font-mono">{g.available.length}</SidebarMenuBadge>
                            <CollapsibleContent>
                                <SidebarMenuSub>
                                    {g.available.map((e) => (
                                        <SidebarMenuSubItem key={e.id}>
                                            <SidebarMenuSubButton
                                                isActive={current(e.id)}
                                                render={<PortLink portId={e.id} onClick={onNavigate} />}
                                            >
                                                <span>{e.name}</span>
                                            </SidebarMenuSubButton>
                                        </SidebarMenuSubItem>
                                    ))}
                                    {g.planned > 0 && (
                                        <SidebarMenuSubItem>
                                            <SidebarMenuSubButton
                                                className="text-muted-foreground italic"
                                                render={
                                                    <Link
                                                        to="/ports"
                                                        search={{category: g.category, status: "planned"}}
                                                        onClick={onNavigate}
                                                    />
                                                }
                                            >
                                                <span className="pe-0.5">+{g.planned} planned</span>
                                            </SidebarMenuSubButton>
                                        </SidebarMenuSubItem>
                                    )}
                                </SidebarMenuSub>
                            </CollapsibleContent>
                        </Collapsible>
                    ))}
                </SidebarMenu>
            </SidebarGroup>
        </nav>
    );
}
