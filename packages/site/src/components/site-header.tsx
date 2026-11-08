import {Button} from "@repraze/kernelkit/components/button";
import {
    SiteHeader as SiteHeaderRoot,
    SiteHeaderActions,
    SiteHeaderBanner,
    SiteHeaderBrand,
    SiteHeaderContent,
    SiteHeaderMenu,
    SiteNav,
    SiteNavLink,
} from "@repraze/kernelkit/components/site-header";
import {Link, useLocation} from "@tanstack/react-router";
import {useEffect, useState} from "react";

import {Logo} from "@/brand/logo";
import {GithubIcon} from "@/components/github-icon";
import {PortsTree} from "@/components/ports-tree";
import {SiteSearch} from "@/components/site-search";
import {SpectrumBar} from "@/components/spectrum-bar";
import {ThemeToggle} from "@/components/theme-toggle";

const NAV = [
    {to: "/ports", label: "Ports"},
    {to: "/palette", label: "Palette"},
    {to: "/ports/wallpapers", label: "Wallpapers"},
] as const;

/** The nav entry for a path: the most specific prefix, so /ports/wallpapers is Wallpapers, not Ports. */
export function activeNav(pathname: string): string | undefined {
    return NAV.filter((n) => pathname === n.to || pathname.startsWith(`${n.to}/`)).sort(
        (a, b) => b.to.length - a.to.length,
    )[0]?.to;
}

function NavLinks() {
    const active = activeNav(useLocation({select: (l) => l.pathname}));
    return NAV.map((n) => (
        <SiteNavLink
            key={n.to}
            // the router marks every prefix match current (Ports on /ports/wallpapers): only the most
            // specific entry may match by prefix, the others must match exactly
            render={<Link to={n.to} activeOptions={{exact: active !== n.to}} />}
        >
            {n.label}
        </SiteNavLink>
    ));
}

function Brand({className}: {className?: string}) {
    return (
        <span className={className}>
            <Logo className="size-7" />
            <span className="tracking-widest uppercase">
                termicolor<span className="text-primary-text">_</span>
            </span>
        </span>
    );
}

/** The suite's site header (kernelkit SiteHeader) with Termicolor's spectrum bar as its banner. */
export function SiteHeader() {
    const pathname = useLocation({select: (l) => l.pathname});
    const [open, setOpen] = useState(false);
    useEffect(() => setOpen(false), [pathname]);
    return (
        <SiteHeaderRoot>
            <SiteHeaderBanner>
                <SpectrumBar className="h-1" />
            </SiteHeaderBanner>
            <SiteHeaderContent>
                <SiteHeaderMenu
                    title={<Brand className="flex items-center gap-2 font-mono text-sm font-semibold" />}
                    open={open}
                    onOpenChange={setOpen}
                >
                    <nav aria-label="Site" className="flex flex-col gap-3 px-2 pt-2">
                        <NavLinks />
                    </nav>
                    <PortsTree />
                </SiteHeaderMenu>
                <SiteHeaderBrand aria-label="Termicolor home" render={<Link to="/" />}>
                    <Brand className="flex items-center gap-2" />
                </SiteHeaderBrand>
                <SiteNav aria-label="Site">
                    <NavLinks />
                </SiteNav>
                <SiteHeaderActions>
                    <SiteSearch />
                    <ThemeToggle />
                    <Button
                        variant="ghost"
                        size="icon"
                        render={<a href="https://github.com/repraze/termicolor" aria-label="GitHub" />}
                    >
                        <GithubIcon className="size-4" />
                    </Button>
                </SiteHeaderActions>
            </SiteHeaderContent>
        </SiteHeaderRoot>
    );
}
