/** Builds the site search index (MiniSearch, serialized) into public/data/search.json. Runs after copy-data.ts. */
import {readFile, writeFile} from "node:fs/promises";
import {dirname, join, resolve} from "node:path";
import {fileURLToPath} from "node:url";

import type {RegistryEntry} from "../src/lib/registry";
import {buildDocs, createIndex} from "../src/lib/search";
import type {WallpaperCatalog} from "../src/lib/wallpapers";

const SITE = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const ROOT = resolve(SITE, "../..");
const json = async <T>(path: string) => JSON.parse(await readFile(join(ROOT, path), "utf8")) as T;

const docs = buildDocs({
    registry: await json<RegistryEntry[]>("ports/registry.json"),
    catalog: await json<WallpaperCatalog>("ports/wallpapers/dist/catalog.json"),
    design: await readFile(join(ROOT, "packages/palette/DESIGN.md"), "utf8"),
});
const out = join(SITE, "public/data/search.json");
await writeFile(out, JSON.stringify(createIndex(docs)));
console.log(`✓ search index: ${docs.length} documents`);
