import {queryOptions} from "@tanstack/react-query";
import type {Category, PortMeta, Verified} from "@termicolor/build";

export type RegistryEntry = PortMeta &
    (
        | {status: "available"; install: string; source: string; files: string[]; verified?: Verified}
        | {status: "planned"; tier: 1 | 2 | 3; catppuccinStars?: number}
    );

export type Status = RegistryEntry["status"];

/** URL of a generated data file, versioned by build so a deploy never mixes with cached files. */
export const dataUrl = (path: string) => `${import.meta.env.BASE_URL}${path}?v=${import.meta.env.VITE_BUILD_ID}`;

async function fetchJson<T>(path: string): Promise<T> {
    const res = await fetch(dataUrl(path));
    if (!res.ok) {
        throw new Error(`${path}: ${res.status} ${res.statusText}`);
    }
    return res.json() as Promise<T>;
}

export const registryQuery = queryOptions({
    queryKey: ["registry"],
    queryFn: () => fetchJson<RegistryEntry[]>("data/registry.json"),
    staleTime: Infinity,
});

/** An available port nobody has checked in the real app yet (TESTING.md). */
export function needsTesting(entry: RegistryEntry): boolean {
    return entry.status === "available" && !entry.verified;
}

/** Lowercased haystack for client-side search. */
export function searchText(entry: RegistryEntry, categoryLabel: string): string {
    const testing = entry.status !== "available" ? [] : entry.verified ? ["verified"] : ["needs testing", "untested"];
    return [entry.id, entry.name, entry.description, categoryLabel, ...(entry.tags ?? []), ...testing]
        .join(" ")
        .toLowerCase();
}

export type {Category};
