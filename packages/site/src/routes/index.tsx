import {Button} from "@repraze/kernelkit/components/button";
import {SiteContainer} from "@repraze/kernelkit/components/site-layout";
import {allModes} from "@repraze/termicolor";
import {createFileRoute, Link} from "@tanstack/react-router";
import {ArrowRightIcon} from "lucide-react";

import {ModePreview} from "@/components/mode-preview";
import {SwatchStrip} from "@/components/swatch-strip";
import {registryQuery} from "@/lib/registry";

export const Route = createFileRoute("/")({
    loader: ({context}) => context.queryClient.ensureQueryData(registryQuery),
    component: HomePage,
});

function HomePage() {
    const {available} = Route.useLoaderData({
        select: (r) => ({available: r.filter((e) => e.status === "available").length}),
    });
    return (
        <SiteContainer render={<main />} className="flex flex-col gap-12 py-8 lg:py-10">
            <section className="flex flex-col gap-4">
                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                    High contrast. Bright. <span className="text-primary-text">Techy.</span>
                </h1>
                <p className="text-muted-foreground max-w-2xl text-base leading-relaxed">
                    One palette, generated into themes for your editor, terminal, prompt, browser and code blocks. Four
                    modes, the same eight accents, and every color checked for contrast on every build.
                </p>
                <div className="flex flex-wrap gap-2">
                    <Button render={<Link to="/ports" />}>
                        Browse {available} ports <ArrowRightIcon />
                    </Button>
                    <Button variant="outline" render={<Link to="/palette" />}>
                        Palette
                    </Button>
                </div>
                <SwatchStrip />
            </section>
            <section className="flex flex-col gap-4">
                <h2 className="text-lg font-bold">Modes</h2>
                <p className="text-muted-foreground max-w-2xl text-sm">
                    High contrast keeps every color, but puts code on the page background and draws structure with
                    bright borders instead of muted ones.
                </p>
                <div className="grid gap-4 lg:grid-cols-2">
                    {allModes().map((mode) => (
                        <ModePreview key={mode.id} mode={mode} />
                    ))}
                </div>
            </section>
        </SiteContainer>
    );
}
