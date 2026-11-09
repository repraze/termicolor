import {PageHeader, PageHeaderDescription, PageHeaderTitle} from "@repraze/kernelkit/components/page-header";
import {createFileRoute} from "@tanstack/react-router";
import {CATEGORIES} from "@termicolor/build";

import {PortSearch, type PortSearchParams} from "@/components/port-search";
import {useSearchUpdate} from "@/hooks/use-search-update";
import {usePageTitle} from "@/lib/site";

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
    usePageTitle("Ports");
    const search = Route.useSearch();
    const updateSearch = useSearchUpdate<PortSearchParams>();
    return (
        <div className="flex flex-col gap-6">
            <PageHeader>
                <PageHeaderTitle>Ports</PageHeaderTitle>
                <PageHeaderDescription>
                    Every port is generated from the same palette in one build. Planned ones are ranked by how much
                    people use them.
                </PageHeaderDescription>
            </PageHeader>
            <PortSearch params={search} onChange={updateSearch} />
        </div>
    );
}
