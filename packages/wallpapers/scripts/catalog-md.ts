/** Rewrites the kept-seeds table in CATALOG.md from src/catalog.ts. A test fails when they drift. */
import {readFile, writeFile} from "node:fs/promises";
import {dirname, resolve} from "node:path";
import {fileURLToPath} from "node:url";

import {replaceCatalogTable} from "../src/catalog-doc.ts";

const file = resolve(dirname(fileURLToPath(import.meta.url)), "../CATALOG.md");
const before = await readFile(file, "utf8");
const after = replaceCatalogTable(before);
if (after !== before) {
    await writeFile(file, after);
    console.log("✓ CATALOG.md table updated");
} else {
    console.log("✓ CATALOG.md table already up to date");
}
