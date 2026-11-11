import {SuiteFooter} from "@repraze/kernelkit/site";
import type {QueryClient} from "@tanstack/react-query";
import {createRootRouteWithContext, Link, Outlet} from "@tanstack/react-router";

import {SiteHeader} from "@/components/site-header";
import {registryQuery} from "@/lib/registry";

export const Route = createRootRouteWithContext<{queryClient: QueryClient}>()({
    // the header's mobile menu shows the ports tree on every page
    loader: ({context}) => context.queryClient.ensureQueryData(registryQuery),
    component: RootLayout,
});

function RootLayout() {
    return (
        <div className="flex min-h-svh flex-col">
            <SiteHeader />
            {/* pages pick their layout: SiteLayout (with the ports sidebar) or SiteContainer */}
            <div className="flex flex-1 flex-col">
                <Outlet />
            </div>
            <SuiteFooter
                credits={[]}
                tagline="built from one palette"
                links={[
                    {label: "Ports", render: <Link to="/ports" />},
                    {label: "Palette", render: <Link to="/palette" />},
                    {label: "npm", href: "https://www.npmjs.com/package/@repraze/termicolor"},
                    {label: "GitHub", href: "https://github.com/repraze/termicolor"},
                ]}
            />
        </div>
    );
}
