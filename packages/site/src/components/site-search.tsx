import {useDebouncedValue, useHotkeys, useOs} from "@mantine/hooks";
import {Badge} from "@repraze/kernelkit/components/badge";
import {Button} from "@repraze/kernelkit/components/button";
import {
    Command,
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@repraze/kernelkit/components/command";
import {Kbd} from "@repraze/kernelkit/components/kbd";
import {useQuery, useQueryClient} from "@tanstack/react-query";
import {useNavigate} from "@tanstack/react-router";
import {
    CornerDownLeftIcon,
    FileTextIcon,
    ImageIcon,
    type LucideIcon,
    PackageIcon,
    PaletteIcon,
    SearchIcon,
} from "lucide-react";
import {type RefObject, useEffect, useMemo, useRef, useState} from "react";

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
    const os = useOs();
    const queryClient = useQueryClient();
    const prefetch = () => void queryClient.prefetchQuery(searchIndexQuery);
    const mod = os === "macos" || os === "ios" ? "⌘" : "Ctrl";
    useHotkeys([
        ["mod+K", () => setOpen((o) => !o)],
        ["/", () => setOpen(true)],
    ]);

    return (
        <>
            <Button
                variant="outline"
                size="sm"
                onClick={() => setOpen(true)}
                // fetch the index on intent so the first open is instant
                onPointerEnter={prefetch}
                onFocus={prefetch}
                className="text-muted-foreground hidden w-56 justify-start font-sans font-normal sm:inline-flex"
            >
                <SearchIcon />
                <span className="flex-1 text-left">Search…</span>
                <Kbd>{mod} K</Kbd>
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setOpen(true)} aria-label="Search" className="sm:hidden">
                <SearchIcon />
            </Button>
            <CommandDialog
                open={open}
                onOpenChange={setOpen}
                title="Search"
                description="Search ports and pages"
                initialFocus={inputRef}
            >
                {open && <SearchPanel inputRef={inputRef} onDone={() => setOpen(false)} />}
            </CommandDialog>
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
                            <CommandItem key={hit.id} value={hit.id} onSelect={() => go(hit)}>
                                <Icon className="text-muted-foreground" />
                                <div className="flex min-w-0 flex-1 flex-col">
                                    <span className="truncate font-medium">{hit.title}</span>
                                    <span className="text-muted-foreground truncate">{hit.summary}</span>
                                </div>
                                {hit.planned && <Badge variant="secondary">planned</Badge>}
                                <CornerDownLeftIcon className="text-muted-foreground hidden group-data-[selected=true]/command-item:block" />
                            </CommandItem>
                        ))}
                    </CommandGroup>
                ))}
            </CommandList>
            <div className="text-muted-foreground flex items-center gap-3 border-t px-3 py-2 text-xs">
                <span>
                    <Kbd>↑</Kbd> <Kbd>↓</Kbd> move
                </span>
                <span>
                    <Kbd>↵</Kbd> open
                </span>
                <span>
                    <Kbd>esc</Kbd> close
                </span>
            </div>
        </Command>
    );
}
