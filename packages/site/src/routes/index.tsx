import {Badge} from "@repraze/kernelkit/components/badge";
import {Button} from "@repraze/kernelkit/components/button";
import {Card, CardDescription, CardHeader, CardTitle} from "@repraze/kernelkit/components/card";
import {
    Hero,
    HeroActions,
    HeroDescription,
    HeroEyebrow,
    HeroFooter,
    HeroMedia,
    HeroTitle,
} from "@repraze/kernelkit/components/hero";
import {
    Section,
    SectionAction,
    SectionDescription,
    SectionEyebrow,
    SectionHeader,
    SectionTitle,
} from "@repraze/kernelkit/components/section";
import {SiteContainer} from "@repraze/kernelkit/components/site-layout";
import {ACCENTS, allModes} from "@repraze/termicolor";
import {useQuery} from "@tanstack/react-query";
import {createFileRoute, Link} from "@tanstack/react-router";
import {CATEGORIES} from "@termicolor/build";
import {ArrowRightIcon} from "lucide-react";

import {Logo} from "@/brand/logo";
import {CodeBlock} from "@/components/code-block";
import {GithubIcon} from "@/components/github-icon";
import {ModePreview} from "@/components/mode-preview";
import {PortLink} from "@/components/port-link";
import {SwatchStrip} from "@/components/swatch-strip";
import {useTheme} from "@/hooks/use-theme";
import {dataUrl, registryQuery} from "@/lib/registry";
import {catalogQuery} from "@/lib/wallpaper-catalog";
import {thumbPath} from "@/lib/wallpapers";

export const Route = createFileRoute("/")({
    loader: ({context}) => context.queryClient.ensureQueryData(registryQuery),
    component: HomePage,
});

/** The ports most people come for, shown first. */
const FEATURED = ["vscode", "windows-terminal", "ghostty", "starship", "bat", "chrome"];

const USAGE = `import {createPalette} from "@repraze/termicolor";

const palette = createPalette({accent: "pink"});
palette.modes.dark.roles.bg; // "#171717"`;

function HomePage() {
    const available = Route.useLoaderData({select: (r) => r.filter((e) => e.status === "available")});
    const featured = FEATURED.flatMap((id) => available.filter((e) => e.id === id));
    return (
        <main className="flex flex-1 flex-col">
            <Hero>
                <HeroMedia>
                    <Logo className="size-16 md:size-20" />
                </HeroMedia>
                <HeroEyebrow>
                    <Badge variant="outline" className="font-mono">
                        {available.length} ports · {allModes().length} modes · {ACCENTS.length} accents
                    </Badge>
                </HeroEyebrow>
                <HeroTitle>
                    High contrast. Bright. <span className="text-primary-text">Techy.</span>
                </HeroTitle>
                <HeroDescription>
                    One palette, generated into themes for your editor, terminal, prompt, browser and code blocks. Every
                    color checked for contrast on every build.
                </HeroDescription>
                <HeroActions>
                    <Button size="lg" render={<Link to="/ports" />}>
                        Browse {available.length} ports <ArrowRightIcon data-icon="inline-end" />
                    </Button>
                    <Button size="lg" variant="outline" render={<Link to="/palette" />}>
                        Explore the palette
                    </Button>
                </HeroActions>
                <HeroFooter>
                    <SwatchStrip className="w-full max-w-3xl [&>div]:h-12" />
                </HeroFooter>
            </Hero>

            <SiteContainer className="divide-border flex flex-col divide-y">
                <Section>
                    <SectionHeader>
                        <SectionEyebrow>Ports</SectionEyebrow>
                        <SectionTitle>Themes for the tools you live in</SectionTitle>
                        <SectionDescription>
                            Editors, terminals, prompts, CLI tools and browsers, each generated from the same palette in
                            one build, in every accent.
                        </SectionDescription>
                        <SectionAction>
                            <Button variant="outline" render={<Link to="/ports" />}>
                                All {available.length} ports <ArrowRightIcon data-icon="inline-end" />
                            </Button>
                        </SectionAction>
                    </SectionHeader>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {featured.map((port) => (
                            <PortLink
                                key={port.id}
                                portId={port.id}
                                className="group/port focus-visible:ring-ring/50 outline-none focus-visible:ring-3"
                            >
                                <Card className="group-hover/port:bg-hover h-full transition-colors">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            {port.name}
                                            <Badge variant="outline" className="ml-auto font-mono">
                                                {CATEGORIES[port.category]}
                                            </Badge>
                                        </CardTitle>
                                        <CardDescription>{port.description}</CardDescription>
                                    </CardHeader>
                                </Card>
                            </PortLink>
                        ))}
                    </div>
                </Section>

                <Section>
                    <SectionHeader>
                        <SectionEyebrow>Modes</SectionEyebrow>
                        <SectionTitle>Light, dark, and high contrast</SectionTitle>
                        <SectionDescription>
                            High contrast keeps every color, but puts code on the page background and draws structure
                            with bright borders instead of muted ones.
                        </SectionDescription>
                        <SectionAction>
                            <Button variant="outline" render={<Link to="/palette" />}>
                                The palette <ArrowRightIcon data-icon="inline-end" />
                            </Button>
                        </SectionAction>
                    </SectionHeader>
                    <div className="grid gap-4 lg:grid-cols-2">
                        {allModes().map((mode) => (
                            <ModePreview key={mode.id} mode={mode} />
                        ))}
                    </div>
                </Section>

                <Section>
                    <SectionHeader>
                        <SectionEyebrow>Wallpapers</SectionEyebrow>
                        <SectionTitle>Wallpapers to match</SectionTitle>
                        <SectionDescription>
                            Gradients, lines and patterns in the palette's colors, from 1080p to 4K, light and dark.
                        </SectionDescription>
                        <SectionAction>
                            <Button variant="outline" render={<Link to="/ports/wallpapers" />}>
                                Get wallpapers <ArrowRightIcon data-icon="inline-end" />
                            </Button>
                        </SectionAction>
                    </SectionHeader>
                    <WallpaperPreview />
                </Section>

                <Section>
                    <SectionHeader>
                        <SectionEyebrow>Developers</SectionEyebrow>
                        <SectionTitle>The palette in your code</SectionTitle>
                        <SectionDescription>
                            CSS variables, JSON and TypeScript, with shadcn tokens on top. Kernelkit is built on it.
                        </SectionDescription>
                        <SectionAction>
                            <Button
                                variant="outline"
                                render={<a href="https://github.com/repraze/termicolor/tree/main/packages/palette" />}
                            >
                                <GithubIcon data-icon="inline-start" className="size-4" /> Read the docs
                            </Button>
                        </SectionAction>
                    </SectionHeader>
                    <div className="grid items-start gap-4 lg:grid-cols-2">
                        <CodeBlock lang="shellscript" code="npm install @repraze/termicolor" />
                        <CodeBlock lang="tsx" code={USAGE} />
                    </div>
                </Section>
            </SiteContainer>
        </main>
    );
}

/** One wallpaper per family, in the current mode. */
function WallpaperPreview() {
    const {data: catalog} = useQuery(catalogQuery);
    const mode = useTheme().resolved === "light" ? "light" : "dark";
    const picks = catalog
        ? Object.keys(catalog.families).flatMap((family) =>
              catalog.wallpapers.filter((w) => w.family === family).slice(0, 1),
          )
        : [];
    return (
        <div className="grid gap-4 sm:grid-cols-3">
            {picks.map((w) => (
                <Link
                    key={w.id}
                    to="/ports/wallpapers"
                    search={{family: w.family}}
                    className="group/wp focus-visible:ring-ring/50 overflow-hidden border outline-none focus-visible:ring-3"
                >
                    <img
                        src={dataUrl(`ports/wallpapers/${thumbPath(w.id, mode, "landscape")}`)}
                        alt={`${w.name} wallpaper`}
                        className="aspect-video w-full object-cover transition-transform group-hover/wp:scale-[1.02] motion-reduce:transition-none"
                        loading="lazy"
                    />
                </Link>
            ))}
        </div>
    );
}
