import type {Rng} from "./random.ts";

export type Noise2 = (x: number, y: number) => number;

/** Seeded 2D Perlin gradient noise, roughly in [-1, 1]. */
export function perlin(rng: Rng): Noise2 {
    const perm = new Uint8Array(512);
    const order = rng.shuffle(Array.from({length: 256}, (_, i) => i));
    for (let i = 0; i < 512; i++) {
        perm[i] = order[i & 255]!;
    }
    const grads = Array.from({length: 256}, () => {
        const a = rng.range(0, Math.PI * 2);
        return [Math.cos(a), Math.sin(a)] as const;
    });
    const fade = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
    const dot = (ix: number, iy: number, x: number, y: number) => {
        const g = grads[perm[(ix & 255) + perm[iy & 255]!]!]!;
        return g[0] * (x - ix) + g[1] * (y - iy);
    };
    return (x, y) => {
        const x0 = Math.floor(x);
        const y0 = Math.floor(y);
        const u = fade(x - x0);
        const v = fade(y - y0);
        const a = dot(x0, y0, x, y) + u * (dot(x0 + 1, y0, x, y) - dot(x0, y0, x, y));
        const b = dot(x0, y0 + 1, x, y) + u * (dot(x0 + 1, y0 + 1, x, y) - dot(x0, y0 + 1, x, y));
        return (a + v * (b - a)) * 1.4;
    };
}

/** Fractal sum of `octaves` noise layers. */
export function fbm(noise: Noise2, octaves = 4): Noise2 {
    return (x, y) => {
        let sum = 0;
        let amp = 0.5;
        let freq = 1;
        let norm = 0;
        for (let o = 0; o < octaves; o++) {
            sum += noise(x * freq + o * 17.3, y * freq - o * 9.1) * amp;
            norm += amp;
            amp *= 0.5;
            freq *= 2;
        }
        return sum / norm;
    };
}
