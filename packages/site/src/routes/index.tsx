import {createFileRoute} from "@tanstack/react-router";
import {CATEGORIES} from "@termicolor/build";

import {PortSearch, type PortSearchParams} from "@/components/port-search";
import {SwatchStrip} from "@/components/swatch-strip";
import {registryQuery} from "@/lib/registry";

const STATUSES = ["all", "available", "planned"] as const;

export const Route = createFileRoute("/")({
    validateSearch: (search: Record<string, unknown>): PortSearchParams => ({
        q: typeof search.q === "string" && search.q ? search.q : undefined,
        category:
            typeof search.category === "string" && search.category in CATEGORIES
                ? (search.category as PortSearchParams["category"])
                : undefined,
        status: STATUSES.includes(search.status as (typeof STATUSES)[number])
            ? (search.status as PortSearchParams["status"])
            : undefined,
    }),
    loader: ({context}) => context.queryClient.ensureQueryData(registryQuery),
    component: HomePage,
});

function HomePage() {
    const search = Route.useSearch();
    const navigate = Route.useNavigate();
    return (
        <div className="flex flex-col gap-10">
            <section className="flex flex-col gap-4">
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                    High contrast. Bright. <span className="text-primary">Techy.</span>
                </h1>
                <p className="text-muted-foreground max-w-2xl text-sm">
                    One palette, generated into themes for your editor, terminal, prompt, browser and code blocks. Every
                    color is checked for contrast on every build.
                </p>
                <SwatchStrip />
            </section>
            <PortSearch params={search} onChange={(next) => navigate({search: next, replace: true})} />
        </div>
    );
}
