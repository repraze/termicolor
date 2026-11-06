/**
 * Contact sheets for picking and tuning wallpapers. Writes thumbnails + PNG sheets to `.preview/`
 * (gitignored) and prints the PNG paths.
 *
 *   npm run preview -w @termicolor/wallpapers                                  # the kept catalog
 *   npm run preview -w @termicolor/wallpapers -- --generator flow --seeds 1-20 # candidates
 *   … --mode dark --orientation portrait --lead red --harmony split           # narrow it down
 *
 * Thumbnails are rendered at thumbnail size through the viewBox (the same path the real files take),
 * not scaled down in the browser.
 */
import {existsSync} from "node:fs";
import {mkdir, rm, writeFile} from "node:fs/promises";
import {homedir} from "node:os";
import {dirname, join, resolve} from "node:path";
import {fileURLToPath} from "node:url";
import {parseArgs} from "node:util";

import {chromium} from "@playwright/test";
import {type AccentName, ACCENTS, type ModeName, MODES, palette} from "@termicolor/palette";

import {CATALOG, type CatalogEntry} from "../src/catalog.ts";
import {HARMONY_NAMES, type HarmonyName} from "../src/harmony.ts";
import {getGenerator, renderWallpaper, resolveSpec} from "../src/render.ts";

const OUT = resolve(dirname(fileURLToPath(import.meta.url)), "../.preview");
const ORIENTATIONS = {
    landscape: {width: 480, height: 270, columns: 5},
    portrait: {width: 216, height: 384, columns: 9},
} as const;
type Orientation = keyof typeof ORIENTATIONS;

const {values: args} = parseArgs({
    options: {
        generator: {type: "string"},
        seeds: {type: "string", default: "1-20"},
        mode: {type: "string"},
        orientation: {type: "string"},
        lead: {type: "string"},
        harmony: {type: "string"},
    },
});

function seedRange(text: string): number[] {
    return text.split(",").flatMap((part) => {
        const [a, b] = part.split("-").map(Number);
        if (!Number.isInteger(a) || (b !== undefined && !Number.isInteger(b))) {
            throw new Error(`Bad --seeds "${text}" (use e.g. 1-20 or 3,7,12)`);
        }
        return b === undefined ? [a!] : Array.from({length: b - a! + 1}, (_, i) => a! + i);
    });
}

function oneOf<T extends string>(value: string | undefined, allowed: readonly T[], flag: string): T | undefined {
    if (value !== undefined && !allowed.includes(value as T)) {
        throw new Error(`--${flag} must be one of ${allowed.join(", ")}`);
    }
    return value as T | undefined;
}

const lead = oneOf<AccentName>(args.lead, ACCENTS, "lead");
const harmony = oneOf<HarmonyName>(args.harmony, HARMONY_NAMES, "harmony");
const modes = args.mode ? [oneOf<ModeName>(args.mode, MODES, "mode")!] : [...MODES];
const orientations = args.orientation
    ? [oneOf<Orientation>(args.orientation, ["landscape", "portrait"], "orientation")!]
    : (["landscape", "portrait"] as Orientation[]);

const entries: CatalogEntry[] = args.generator
    ? (getGenerator(args.generator),
      seedRange(args.seeds!).map((seed) => ({
          id: `${args.generator}-${seed}`,
          generator: args.generator!,
          seed,
          params: {lead, harmony},
      })))
    : [...CATALOG];

const name = args.generator ? `${args.generator}-${args.seeds}` : "catalog";
const dir = join(OUT, name);
await rm(dir, {recursive: true, force: true});

const sheets: {html: string; png: string; width: number}[] = [];
for (const mode of modes) {
    for (const orientation of orientations) {
        const box = ORIENTATIONS[orientation];
        const figures: string[] = [];
        for (const e of entries) {
            const file = `${mode}-${orientation}/${e.id}.svg`;
            await mkdir(join(dir, dirname(file)), {recursive: true});
            await writeFile(join(dir, file), renderWallpaper(e, {palette, mode, size: box}));
            const r = resolveSpec(e);
            const caption = `${e.id} · ${r.harmony}<br>${r.params.accents.join(" ")}`;
            figures.push(`<figure><img src="${file}"><figcaption>${caption}</figcaption></figure>`);
        }
        const width = box.columns * (box.width + 8) + 8;
        const html = join(dir, `sheet-${mode}-${orientation}.html`);
        await writeFile(
            html,
            `<!doctype html><style>body{margin:0;background:#333;display:flex;flex-wrap:wrap;gap:8px;padding:8px;` +
                `font:11px/1.3 monospace;color:#ccc;width:${width - 16}px}figure{margin:0;width:${box.width}px}` +
                `img{display:block;width:${box.width}px;height:${box.height}px}</style>${figures.join("")}`,
        );
        sheets.push({html, png: html.replace(/\.html$/, ".png"), width});
    }
}

// WSL without sudo: Chromium's missing libs unpacked into ~/.cache/pw-libs (see packages/site/playwright.config.ts).
const libs = join(homedir(), ".cache/pw-libs/root/usr/lib/x86_64-linux-gnu");
const env = existsSync(libs) ? {...process.env, LD_LIBRARY_PATH: `${libs}:${libs}/nss`} : undefined;
const browser = await chromium.launch(env ? {env: env as Record<string, string>} : {});
for (const sheet of sheets) {
    const page = await browser.newPage({viewport: {width: sheet.width, height: 600}});
    await page.goto(`file://${sheet.html}`);
    await page.waitForLoadState("networkidle");
    await page.screenshot({path: sheet.png, fullPage: true});
    await page.close();
    console.log(sheet.png);
}
await browser.close();
