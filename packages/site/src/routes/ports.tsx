import {SiteLayout, SiteSidebar} from "@repraze/kernelkit/components/site-layout";
import {createFileRoute, Outlet} from "@tanstack/react-router";

import {PortsTree} from "@/components/ports-tree";
import {registryQuery} from "@/lib/registry";

export const Route = createFileRoute("/ports")({
    loader: ({context}) => context.queryClient.ensureQueryData(registryQuery),
    component: PortsLayout,
});

function PortsLayout() {
    return (
        <SiteLayout>
            {/* on phones the tree lives in the header menu sheet */}
            <SiteSidebar aria-label="Ports">
                <PortsTree />
            </SiteSidebar>
            {/* each page renders its SiteMain and, with sections, a SiteAside "On this page" */}
            <Outlet />
        </SiteLayout>
    );
}
