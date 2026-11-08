import {SiteFooter, SiteFooterLink, SiteFooterLinks} from "@repraze/kernelkit/components/site-footer";
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
            <SiteFooter>
                <span>
                    MIT · built from one palette · a{" "}
                    <SiteFooterLink href="https://repraze.com" className="underline underline-offset-4">
                        repraze.com
                    </SiteFooterLink>{" "}
                    project
                </span>
                <SiteFooterLinks aria-label="Footer">
                    <SiteFooterLink render={<Link to="/ports" />}>Ports</SiteFooterLink>
                    <SiteFooterLink render={<Link to="/palette" />}>Palette</SiteFooterLink>
                    <SiteFooterLink href="https://www.npmjs.com/package/@repraze/termicolor">npm</SiteFooterLink>
                    <SiteFooterLink href="https://github.com/repraze/termicolor">GitHub</SiteFooterLink>
                </SiteFooterLinks>
            </SiteFooter>
        </div>
    );
}
