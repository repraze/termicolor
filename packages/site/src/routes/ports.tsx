import {createFileRoute, Outlet} from "@tanstack/react-router";
import {useStickyBox} from "react-sticky-box";

import {PortsTree} from "@/components/ports-tree";
import {HEADER_OFFSET} from "@/components/site-header";
import {registryQuery} from "@/lib/registry";

export const Route = createFileRoute("/ports")({
    loader: ({context}) => context.queryClient.ensureQueryData(registryQuery),
    component: PortsLayout,
});

function PortsLayout() {
    // Same approach as repraze.com post pages: a sidebar taller than the viewport scrolls with the
    // page until its end is visible, then sticks - no inner scrollbar, nothing unreachable.
    const sidebarRef = useStickyBox({offsetTop: HEADER_OFFSET + 16, offsetBottom: 16});
    return (
        <div className="flex gap-8">
            {/* on mobile the tree lives in the header menu sheet */}
            <aside className="hidden w-52 shrink-0 self-start md:block" ref={sidebarRef}>
                <PortsTree />
            </aside>
            <div className="min-w-0 flex-1">
                <Outlet />
            </div>
        </div>
    );
}
