import {ThemeMenu} from "@repraze/kernelkit/components/theme-menu";
import {BrandLogo, SuiteHeader} from "@repraze/kernelkit/site";
import {Link, useLocation} from "@tanstack/react-router";

import {markSvg} from "@/brand/mark";
import {PortsTree} from "@/components/ports-tree";
import {SiteSearch} from "@/components/site-search";
import {SITE_NAME} from "@/lib/site";

const MARK_SVG = markSvg();

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

/** The suite's site header with TermiColor's brand, sections, port search and the ports tree. */
export function SiteHeader() {
    const pathname = useLocation({select: (l) => l.pathname});
    const active = activeNav(pathname);
    return (
        <SuiteHeader
            brand={<BrandLogo svg={MARK_SVG} first="Termi" second="Color" />}
            brandLabel={`${SITE_NAME} home`}
            home={<Link to="/" />}
            navLabel="Site"
            nav={NAV.map((n) => ({
                label: n.label,
                // current is the most specific section (aria-current); the router's own match must be exact,
                // or it would also mark Ports on /ports/wallpapers
                render: <Link to={n.to} activeOptions={{exact: true}} />,
                current: active === n.to,
            }))}
            search={<SiteSearch />}
            themeMenu={<ThemeMenu data-testid="theme-menu" />}
            repository={{href: "https://github.com/repraze/termicolor"}}
            menu={<PortsTree />}
            locationKey={pathname}
        />
    );
}
