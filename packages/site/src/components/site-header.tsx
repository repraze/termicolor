import {Link, useLocation} from "@tanstack/react-router";
import {MenuIcon} from "lucide-react";
import {useState} from "react";

import {Logo} from "@/brand/logo";
import {GithubIcon} from "@/components/github-icon";
import {PortsTree} from "@/components/ports-tree";
import {SiteSearch} from "@/components/site-search";
import {SpectrumBar} from "@/components/spectrum-bar";
import {ThemeToggle} from "@/components/theme-toggle";
import {Button} from "@/components/ui/button";
import {Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger} from "@/components/ui/sheet";

/** Spectrum bar (4px) + header row (48px) + bottom border; sticky sidebars offset by this. */
export const HEADER_OFFSET = 53;

const navLink =
    "text-muted-foreground hover:text-foreground aria-[current=page]:text-foreground aria-[current=page]:underline aria-[current=page]:decoration-primary aria-[current=page]:decoration-2 aria-[current=page]:underline-offset-8";

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

function NavLinks({onNavigate}: {onNavigate?: () => void}) {
    const active = activeNav(useLocation({select: (l) => l.pathname}));
    return NAV.map((n) => (
        <Link
            key={n.to}
            to={n.to}
            className={navLink}
            // the router marks every prefix match current (Ports on /ports/wallpapers): only the most
            // specific entry may match by prefix, the others must match exactly
            activeOptions={{exact: active !== n.to}}
            onClick={onNavigate}
        >
            {n.label}
        </Link>
    ));
}

/** Sticky site header. Below `md` the nav and the ports tree move into a sheet. */
export function SiteHeader() {
    const [open, setOpen] = useState(false);
    return (
        <header className="bg-background sticky top-0 z-40 border-b">
            <SpectrumBar className="h-1" />
            <div className="mx-auto flex h-12 max-w-6xl items-center gap-4 px-4 font-mono text-xs sm:gap-6">
                <Sheet open={open} onOpenChange={setOpen}>
                    <SheetTrigger
                        render={<Button variant="ghost" size="icon-sm" className="-ml-2 md:hidden" aria-label="Menu" />}
                    >
                        <MenuIcon />
                    </SheetTrigger>
                    <SheetContent side="left" className="w-72 overflow-y-auto overscroll-contain">
                        <SheetHeader>
                            <SheetTitle className="flex items-center gap-2 font-mono tracking-widest uppercase">
                                <Logo className="size-6" /> termicolor
                            </SheetTitle>
                        </SheetHeader>
                        <nav className="flex flex-col gap-1 border-b px-4 pb-4 font-mono text-sm" aria-label="Site">
                            <NavLinks onNavigate={() => setOpen(false)} />
                        </nav>
                        <div className="px-2 pb-6">
                            <PortsTree onNavigate={() => setOpen(false)} />
                        </div>
                    </SheetContent>
                </Sheet>
                <Link to="/" className="flex items-center gap-2 font-bold tracking-widest uppercase">
                    <Logo className="size-8" />
                    <span>
                        termicolor<span className="text-primary">_</span>
                    </span>
                </Link>
                <nav className="hidden gap-4 md:flex" aria-label="Site">
                    <NavLinks />
                </nav>
                <div className="ml-auto flex items-center gap-1">
                    <SiteSearch />
                    <ThemeToggle />
                    <Button
                        variant="ghost"
                        size="icon"
                        render={<a href="https://github.com/repraze/termicolor" aria-label="GitHub" />}
                    >
                        <GithubIcon />
                    </Button>
                </div>
            </div>
        </header>
    );
}
