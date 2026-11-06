import type {QueryClient} from "@tanstack/react-query";
import {createRootRouteWithContext, Link, Outlet} from "@tanstack/react-router";

import {Logo} from "@/brand/logo";
import {GithubIcon} from "@/components/github-icon";
import {SpectrumBar} from "@/components/spectrum-bar";
import {ThemeToggle} from "@/components/theme-toggle";
import {Button} from "@/components/ui/button";

export const Route = createRootRouteWithContext<{queryClient: QueryClient}>()({
    component: RootLayout,
});

const navLinkClass = "text-muted-foreground hover:text-foreground data-[status=active]:text-foreground";

function RootLayout() {
    return (
        <div className="flex min-h-svh flex-col">
            <SpectrumBar className="h-1" />
            <header className="border-b">
                <div className="mx-auto flex h-12 max-w-6xl items-center gap-6 px-4 font-mono text-xs">
                    <Link to="/" className="flex items-center gap-2 font-bold tracking-widest uppercase">
                        <Logo className="size-8" />
                        <span>
                            termicolor<span className="text-primary">_</span>
                        </span>
                    </Link>
                    <nav className="flex gap-4">
                        <Link to="/ports" className={navLinkClass}>
                            Ports
                        </Link>
                        <Link to="/palette" className={navLinkClass}>
                            Palette
                        </Link>
                    </nav>
                    <div className="ml-auto flex items-center gap-1">
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
            <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
                <Outlet />
            </main>
            <footer className="text-muted-foreground border-t py-4 text-center font-mono text-xs">
                MIT · built from one palette ·{" "}
                <a className="hover:text-foreground underline" href="https://repraze.com">
                    repraze.com
                </a>
            </footer>
        </div>
    );
}
