/** Seeded PRNG (mulberry32). Same seed, same sequence, on every platform. */
export type Rng = {
    /** Uniform float in [0, 1). */
    next(): number;
    /** Uniform float in [min, max). */
    range(min: number, max: number): number;
    /** Uniform integer in [min, max] (inclusive). */
    int(min: number, max: number): number;
    chance(p: number): boolean;
    pick<T>(items: readonly T[]): T;
    shuffle<T>(items: readonly T[]): T[];
};

/** FNV-1a, so string keys (generator id + seed) become well-spread 32-bit seeds. */
export function hash(key: string): number {
    let h = 0x811c9dc5;
    for (let i = 0; i < key.length; i++) {
        h ^= key.charCodeAt(i);
        h = Math.imul(h, 0x01000193);
    }
    return h >>> 0;
}

export function createRng(seed: number | string): Rng {
    let state = typeof seed === "string" ? hash(seed) : seed >>> 0;
    const next = () => {
        state = (state + 0x6d2b79f5) >>> 0;
        let t = state;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    const int = (min: number, max: number) => min + Math.floor(next() * (max - min + 1));
    return {
        next,
        range: (min, max) => min + next() * (max - min),
        int,
        chance: (p) => next() < p,
        pick: (items) => {
            if (!items.length) {
                throw new RangeError("pick() from an empty list");
            }
            return items[int(0, items.length - 1)]!;
        },
        shuffle: (items) => {
            const out = [...items];
            for (let i = out.length - 1; i > 0; i--) {
                const j = int(0, i);
                [out[i], out[j]] = [out[j]!, out[i]!];
            }
            return out;
        },
    };
}
