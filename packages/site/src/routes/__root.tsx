import type {QueryClient} from "@tanstack/react-query";
import {createRootRouteWithContext, Outlet} from "@tanstack/react-router";

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
            <footer className="text-muted-foreground border-t py-4 text-center font-mono text-xs">
                MIT · built from one palette ·{" "}
                <a className="hover:text-foreground underline" href="https://repraze.com">
                    repraze.com
                </a>
            </footer>
        </div>
    );
}
