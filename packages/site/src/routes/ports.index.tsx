import {createFileRoute} from "@tanstack/react-router";
import {CATEGORIES} from "@termicolor/build";

import {PortSearch, type PortSearchParams} from "@/components/port-search";
import {useSearchUpdate} from "@/hooks/use-search-update";

const STATUSES = ["all", "available", "planned"] as const;

export const Route = createFileRoute("/ports/")({
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
    component: PortsIndex,
});

function PortsIndex() {
    const search = Route.useSearch();
    const updateSearch = useSearchUpdate<PortSearchParams>();
    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold">Ports</h1>
                <p className="text-muted-foreground text-sm">
                    Every port is generated from the same palette in one build. Planned ones are ranked by how much
                    people use them.
                </p>
            </div>
            <PortSearch params={search} onChange={updateSearch} />
        </div>
    );
}
