import {useDebouncedValue} from "@mantine/hooks";
import {Badge} from "@repraze/kernelkit/components/badge";
import {Command, CommandEmpty, CommandGroup, CommandInput, CommandList} from "@repraze/kernelkit/components/command";
import {SearchDialog, SearchFooter, SearchItem} from "@repraze/kernelkit/components/search-dialog";
import {SearchTrigger, useSearchHotkeys} from "@repraze/kernelkit/components/search-trigger";
import {useQuery, useQueryClient} from "@tanstack/react-query";
import {useNavigate} from "@tanstack/react-router";
import {FileTextIcon, ImageIcon, type LucideIcon, PackageIcon, PaletteIcon} from "lucide-react";
import {type RefObject, useCallback, useEffect, useMemo, useRef, useState} from "react";

import {search, type SearchHit, searchIndexQuery, type SearchKind} from "@/lib/search";

const GROUPS: {kind: SearchKind; label: string; icon: LucideIcon}[] = [
    {kind: "port", label: "Ports", icon: PackageIcon},
    {kind: "page", label: "Pages", icon: FileTextIcon},
    {kind: "palette", label: "Palette", icon: PaletteIcon},
    {kind: "wallpaper", label: "Wallpapers", icon: ImageIcon},
];

/** Shown before you type. */
const SUGGESTED: SearchHit[] = [
    {
        id: "page:ports",
        kind: "page",
        title: "All ports",
        summary: "Every app termicolor themes.",
        to: "/ports",
        score: 0,
    },
    {
        id: "page:palette",
        kind: "page",
        title: "Palette",
        summary: "Accents, roles, ANSI, contrast.",
        to: "/palette",
        score: 0,
    },
    {
        id: "wallpaper:all",
        kind: "wallpaper",
        title: "Wallpapers",
        summary: "Abstract wallpapers, 1080p to 4K.",
        to: "/ports/wallpapers",
        score: 0,
    },
];

/**
 * Site-wide search: a button in the header, `/` or ⌘K/Ctrl+K anywhere. The index is built at build
 * time (scripts/search-index.ts) and fetched the first time the dialog opens.
 */
export function SiteSearch() {
    const [open, setOpen] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const queryClient = useQueryClient();
    const prefetch = () => void queryClient.prefetchQuery(searchIndexQuery);
    // the suite's search shortcuts and trigger (kernelkit): Ctrl/⌘ K toggles, / opens
    useSearchHotkeys(useCallback((toggle: boolean) => setOpen((o) => (toggle ? !o : true)), []));

    return (
        <>
            <SearchTrigger
                onClick={() => setOpen(true)}
                // fetch the index on intent so the first open is instant
                onPointerEnter={prefetch}
                onFocus={prefetch}
            />
            <SearchDialog
                open={open}
                onOpenChange={setOpen}
                description="Search ports and pages"
                initialFocus={inputRef}
            >
                {open && <SearchPanel inputRef={inputRef} onDone={() => setOpen(false)} />}
            </SearchDialog>
        </>
    );
}

function SearchPanel({inputRef, onDone}: {inputRef: RefObject<HTMLInputElement | null>; onDone: () => void}) {
    const navigate = useNavigate();
    const [query, setQuery] = useState("");
    const [debounced] = useDebouncedValue(query, 60);
    const {data: index, error, isPending} = useQuery(searchIndexQuery);

    const hits = useMemo(
        () => (debounced.trim() ? (index ? search(index, debounced) : []) : SUGGESTED),
        [index, debounced],
    );

    // shown grouped, in GROUPS order; cmdk doesn't move its selection when items are swapped out
    // under it (shouldFilter={false}), so the first visible result is selected explicitly
    const groups = useMemo(
        () => GROUPS.map((g) => ({...g, hits: hits.filter((h) => h.kind === g.kind)})).filter((g) => g.hits.length),
        [hits],
    );
    // reopening right after a close races the dialog's focus restore: claim focus once mounted
    useEffect(() => {
        const frame = requestAnimationFrame(() => inputRef.current?.focus());
        return () => cancelAnimationFrame(frame);
    }, [inputRef]);

    const [selected, setSelected] = useState("");
    useEffect(() => setSelected(groups[0]?.hits[0]?.id ?? ""), [groups]);

    const go = (hit: SearchHit) => {
        onDone();
        void navigate({to: hit.to, search: hit.search as never, hash: hit.hash});
    };

    return (
        <Command shouldFilter={false} loop label="Search" value={selected} onValueChange={setSelected}>
            <CommandInput
                ref={inputRef}
                value={query}
                onValueChange={setQuery}
                placeholder="Search ports, palette, wallpapers…"
            />
            <CommandList>
                <CommandEmpty>
                    {error
                        ? "Search is unavailable."
                        : isPending && debounced
                          ? "Loading…"
                          : `No results for “${debounced}”.`}
                </CommandEmpty>
                {groups.map(({kind, label, icon: Icon, hits: group}) => (
                    <CommandGroup key={kind} heading={label}>
                        {group.map((hit) => (
                            <SearchItem
                                key={hit.id}
                                value={hit.id}
                                onSelect={() => go(hit)}
                                icon={<Icon />}
                                title={hit.title}
                                description={hit.summary}
                                meta={hit.planned ? <Badge variant="secondary">planned</Badge> : null}
                            />
                        ))}
                    </CommandGroup>
                ))}
            </CommandList>
            <SearchFooter />
        </Command>
    );
}
