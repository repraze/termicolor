import {useCallback, useSyncExternalStore} from "react";

/**
 * A preference kept in localStorage, read through `useSyncExternalStore`: every component using the
 * same key shares one value, and other tabs follow through the `storage` event. The default is never
 * written, so changing a default reaches everyone who hasn't picked. Values are JSON (index.html's
 * pre-paint script and the e2e fixtures read and write the same format).
 */
export type Stored<T> = {
    key: string;
    defaultValue: T;
    get: () => T;
    set: (value: T) => void;
    subscribe: (onChange: () => void) => () => void;
};

export function stored<T>(key: string, defaultValue: T, isValid: (value: unknown) => value is T): Stored<T> {
    const listeners = new Set<() => void>();
    const notify = () => listeners.forEach((l) => l());
    const onStorage = (e: StorageEvent) => (e.key === key || e.key === null) && notify();

    // localStorage throws when blocked (privacy modes): keep the choice in memory until reload
    let memory: string | null = null;
    const read = (): string | null => {
        try {
            return localStorage.getItem(key);
        } catch {
            return memory;
        }
    };
    let raw: string | null | undefined;
    let value = defaultValue;

    return {
        key,
        defaultValue,
        get() {
            const next = read();
            if (next !== raw) {
                raw = next;
                let parsed: unknown;
                try {
                    parsed = next === null ? undefined : JSON.parse(next);
                } catch {
                    parsed = undefined;
                }
                value = isValid(parsed) ? parsed : defaultValue;
            }
            return value;
        },
        set(next) {
            memory = JSON.stringify(next);
            try {
                localStorage.setItem(key, memory);
            } catch {
                // blocked: `read` falls back to `memory`
            }
            notify();
        },
        subscribe(onChange) {
            if (listeners.size === 0) {
                window.addEventListener("storage", onStorage);
            }
            listeners.add(onChange);
            return () => {
                listeners.delete(onChange);
                if (listeners.size === 0) {
                    window.removeEventListener("storage", onStorage);
                }
            };
        },
    };
}

export function useStored<T>(store: Stored<T>): [T, (value: T) => void] {
    const value = useSyncExternalStore(store.subscribe, store.get, () => store.defaultValue);
    return [value, useCallback((next: T) => store.set(next), [store])];
}

export const oneOf =
    <const T extends string>(options: readonly T[]) =>
    (value: unknown): value is T =>
        options.includes(value as T);
