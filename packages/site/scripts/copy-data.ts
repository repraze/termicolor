/** Copies the generated registry and port outputs into public/ so the site can serve and link them. */
import {cp, mkdir, rm} from "node:fs/promises";
import {dirname, join, resolve} from "node:path";
import {fileURLToPath} from "node:url";

const SITE = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const ROOT = resolve(SITE, "../..");
const PUBLIC = join(SITE, "public");

await rm(join(PUBLIC, "data"), {recursive: true, force: true});
await rm(join(PUBLIC, "ports"), {recursive: true, force: true});
await mkdir(join(PUBLIC, "data"), {recursive: true});
await cp(join(ROOT, "ports/registry.json"), join(PUBLIC, "data/registry.json"));
await cp(join(ROOT, "packages/palette/dist/palette.json"), join(PUBLIC, "data/palette.json"));
await cp(join(ROOT, "ports"), join(PUBLIC, "ports"), {
    recursive: true,
    filter: (src) => !src.endsWith(".ts") && !src.endsWith("registry.json"),
});
console.log("✓ site data copied");
