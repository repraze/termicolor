import {mkdir, readdir, rm, writeFile} from "node:fs/promises";
import {dirname, join, resolve} from "node:path";
import {fileURLToPath, pathToFileURL} from "node:url";

import {type AccentName, ACCENTS, checkPalette, createPalette, palette} from "@repraze/termicolor";

import {PLANNED} from "./planned.ts";
import type {PortDefinition, PortFile} from "./port.ts";
import {buildWeb} from "./web.ts";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const PORTS_DIR = join(ROOT, "ports");
const REPO_URL = "https://github.com/repraze/termicolor";

async function writeFiles(dir: string, files: PortFile[]) {
    await rm(dir, {recursive: true, force: true});
    for (const file of files) {
        const target = join(dir, file.path);
        await mkdir(dirname(target), {recursive: true});
        await writeFile(target, file.contents);
    }
}

async function loadPorts(only?: string): Promise<PortDefinition[]> {
    const entries = await readdir(PORTS_DIR, {withFileTypes: true});
    const ids = entries.filter((e) => e.isDirectory() && (!only || e.name === only)).map((e) => e.name);
    const ports = await Promise.all(
        ids.map(async (id) => {
            const mod = (await import(pathToFileURL(join(PORTS_DIR, id, "port.ts")).href)) as {
                default: PortDefinition;
            };
            if (mod.default.id !== id) {
                throw new Error(`ports/${id}/port.ts declares id "${mod.default.id}"`);
            }
            return mod.default;
        }),
    );
    return ports.sort((a, b) => a.name.localeCompare(b.name));
}

function readme(port: PortDefinition, files: PortFile[]): string {
    return `<!-- Generated from port.ts - do not edit -->
# Termicolor for ${port.name}

${port.description}

## Install

${port.install.trim()}

## Files

${files.map((f) => `- [\`dist/${f.path}\`](dist/${f.path})`).join("\n")}
`;
}

/**
 * `cli.ts [port]`                         regenerate the repo: palette dist, every port dist, the registry
 * `cli.ts [port] --accent pink [--out d]` build ports around another accent into `d` (default
 *                                         `out/termicolor-<accent>`), leaving the repo untouched
 */
function parseArgs(argv: string[]) {
    const flag = (name: string) => {
        const i = argv.indexOf(`--${name}`);
        return i === -1 ? undefined : argv[i + 1];
    };
    const accent = flag("accent");
    if (accent && !ACCENTS.includes(accent as AccentName)) {
        throw new Error(`--accent must be one of ${ACCENTS.join(", ")}`);
    }
    const only = argv.find((a, i) => !a.startsWith("--") && !argv[i - 1]?.startsWith("--"));
    return {only, accent: accent as AccentName | undefined, out: flag("out")};
}

async function buildAccent(only: string | undefined, accent: AccentName, out: string) {
    const themed = createPalette({accent});
    const ports = (await loadPorts(only)).filter((p) => p.id !== "wallpapers");
    for (const port of ports) {
        const files = port.build(themed);
        await writeFiles(join(out, port.id), files);
        console.log(`✓ ${join(out, port.id)} (${files.length} files)`);
    }
}

async function main() {
    const {only, accent, out} = parseArgs(process.argv.slice(2));
    if (accent) {
        await buildAccent(only, accent, resolve(out ?? `out/termicolor-${accent}`));
        return;
    }

    const checks = checkPalette(palette);
    const failed = checks.filter((c) => !c.pass);
    for (const c of failed) {
        console.error(`✗ ${c.mode}: ${c.label} ${c.ratio.toFixed(2)} < ${c.min}`);
    }
    if (failed.length) {
        process.exit(1);
    }
    console.log(`✓ palette: ${checks.length} contrast checks`);

    await writeFiles(join(ROOT, "packages/palette/dist"), buildWeb(palette));
    console.log("✓ packages/palette/dist");

    const ports = await loadPorts(only);
    const registry = [];
    for (const port of ports) {
        const files = port.build(palette);
        const dir = join(PORTS_DIR, port.id);
        await writeFiles(join(dir, "dist"), files);
        await writeFile(join(dir, "README.md"), readme(port, files));
        console.log(`✓ ports/${port.id} (${files.length} files)`);
        const {build: _build, ...meta} = port;
        registry.push({
            ...meta,
            status: "available" as const,
            source: `${REPO_URL}/tree/main/ports/${port.id}`,
            files: files.map((f) => f.path),
        });
    }

    if (!only) {
        const available = new Set(ports.map((p) => p.id));
        const planned = PLANNED.filter((p) => !available.has(p.id)).map((p) => ({...p, status: "planned" as const}));
        await writeFile(join(PORTS_DIR, "registry.json"), `${JSON.stringify([...registry, ...planned], null, 4)}\n`);
        console.log(`✓ ports/registry.json (${registry.length} available, ${planned.length} planned)`);
    }
}

await main();
