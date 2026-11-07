import {useDebouncedValue} from "@mantine/hooks";
import {Badge} from "@repraze/kernelkit/components/badge";
import {Input} from "@repraze/kernelkit/components/input";
import {ToggleGroup, ToggleGroupItem} from "@repraze/kernelkit/components/toggle-group";
import {useSuspenseQuery} from "@tanstack/react-query";
import {useWindowVirtualizer} from "@tanstack/react-virtual";
import {CATEGORIES, type Category} from "@termicolor/build";
import {cva} from "class-variance-authority";
import {ArrowRightIcon, FilterIcon} from "lucide-react";
import {useEffect, useMemo, useRef, useState} from "react";

import {PortLink} from "@/components/port-link";
import {clickable} from "@/lib/interactive";
import {type RegistryEntry, registryQuery, searchText, type Status} from "@/lib/registry";
import {cn} from "@/lib/utils";

export type PortSearchParams = {
    q?: string;
    category?: Category;
    status?: Status | "all";
};

const ROW_HEIGHT = 64;

const rowVariants = cva("flex h-full items-center gap-4 border-b px-3 text-sm", {
    variants: {
        status: {
            // the row is the link: accent indicator on the left, accent name, arrow nudges (DESIGN.md §6)
            available: clickable.row,
            planned: "text-muted-foreground",
        },
    },
});

export function PortSearch({params, onChange}: {params: PortSearchParams; onChange: (next: PortSearchParams) => void}) {
    const {data: registry} = useSuspenseQuery(registryQuery);
    const listRef = useRef<HTMLDivElement>(null);
    const [query, setQuery] = useState(params.q ?? "");
    const [debounced] = useDebouncedValue(query, 150);
    const status = params.status ?? "all";

    useEffect(() => {
        if ((debounced || undefined) !== params.q) {
            onChange({...params, q: debounced || undefined});
        }
    }, [debounced, params, onChange]);

    const indexed = useMemo(
        () => registry.map((entry) => ({entry, text: searchText(entry, CATEGORIES[entry.category])})),
        [registry],
    );

    const results = useMemo(() => {
        const terms = debounced.toLowerCase().split(/\s+/).filter(Boolean);
        return indexed
            .filter(({entry, text}) => {
                if (params.category && entry.category !== params.category) {
                    return false;
                }
                if (status !== "all" && entry.status !== status) {
                    return false;
                }
                return terms.every((t) => text.includes(t));
            })
            .map(({entry}) => entry)
            .sort((a, b) => {
                if (a.status !== b.status) {
                    return a.status === "available" ? -1 : 1;
                }
                return a.name.localeCompare(b.name);
            });
    }, [indexed, debounced, params.category, status]);

    const counts = useMemo(
        () => ({
            available: registry.filter((e) => e.status === "available").length,
            planned: registry.filter((e) => e.status === "planned").length,
        }),
        [registry],
    );

    const virtualizer = useWindowVirtualizer({
        count: results.length,
        estimateSize: () => ROW_HEIGHT,
        overscan: 8,
        scrollMargin: listRef.current?.offsetTop ?? 0,
        // the window is shared with the rest of the page: never jump it to 0 on (re)init
        initialOffset: () => (typeof window === "undefined" ? 0 : window.scrollY),
    });

    return (
        <section className="flex flex-col gap-4">
            <div className="flex items-baseline justify-end">
                <span className="text-muted-foreground font-mono text-xs">
                    {counts.available} available · {counts.planned} planned
                </span>
            </div>

            <div className="relative">
                <FilterIcon className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Filter ports, e.g. terminal, vscode, chrome…"
                    className="h-10 pl-9"
                    aria-label="Filter ports"
                />
            </div>

            <div className="flex flex-wrap items-center gap-2">
                <ToggleGroup
                    value={[status]}
                    onValueChange={(value: string[]) =>
                        onChange({
                            ...params,
                            status: value[0] === "all" || !value[0] ? undefined : (value[0] as Status),
                        })
                    }
                    variant="outline"
                    size="sm"
                >
                    <ToggleGroupItem value="all">All</ToggleGroupItem>
                    <ToggleGroupItem value="available">Available</ToggleGroupItem>
                    <ToggleGroupItem value="planned">Planned</ToggleGroupItem>
                </ToggleGroup>
                <ToggleGroup
                    value={params.category ? [params.category] : []}
                    onValueChange={(value: string[]) =>
                        onChange({...params, category: (value[0] as Category | undefined) || undefined})
                    }
                    variant="outline"
                    size="sm"
                    className="flex-wrap"
                >
                    {Object.entries(CATEGORIES).map(([id, label]) => (
                        <ToggleGroupItem key={id} value={id}>
                            {label}
                        </ToggleGroupItem>
                    ))}
                </ToggleGroup>
            </div>

            <div ref={listRef} className="border-t">
                {results.length === 0 ? (
                    <p className="text-muted-foreground py-8 text-center text-sm">
                        Nothing matches. Want it?{" "}
                        <a className="text-primary-text underline" href="https://github.com/repraze/termicolor/issues">
                            Open an issue
                        </a>
                        .
                    </p>
                ) : (
                    <div className="relative" style={{height: virtualizer.getTotalSize()}}>
                        {virtualizer.getVirtualItems().map((item) => {
                            const entry = results[item.index]!;
                            return (
                                <div
                                    key={entry.id}
                                    className="absolute inset-x-0 top-0"
                                    style={{
                                        height: item.size,
                                        transform: `translateY(${item.start - virtualizer.options.scrollMargin}px)`,
                                    }}
                                >
                                    <PortRow entry={entry} />
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </section>
    );
}

function PortRow({entry}: {entry: RegistryEntry}) {
    const body = (
        <>
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className={cn("text-foreground font-medium", entry.status === "available" && clickable.title)}>
                    {entry.name}
                </span>
                <span className="text-muted-foreground truncate text-xs">{entry.description}</span>
            </div>
            <Badge variant="outline" className="hidden sm:inline-flex">
                {CATEGORIES[entry.category]}
            </Badge>
            {entry.status === "available" ? (
                <ArrowRightIcon className={cn("text-primary-text size-4", clickable.arrow)} />
            ) : (
                <Badge variant="secondary">planned</Badge>
            )}
        </>
    );
    if (entry.status === "planned") {
        return <div className={rowVariants({status: "planned"})}>{body}</div>;
    }
    return (
        <PortLink portId={entry.id} className={rowVariants({status: "available"})}>
            {body}
        </PortLink>
    );
}
