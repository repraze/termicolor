/** Writes the brand sprite to public/: the favicon and a 512px mark. Run with `npx tsx scripts/brand.ts`. */
import {mkdir, writeFile} from "node:fs/promises";
import {dirname, join, resolve} from "node:path";
import {fileURLToPath} from "node:url";

import {spriteSvg} from "../src/brand/sprite.ts";

const PUBLIC = join(resolve(dirname(fileURLToPath(import.meta.url)), ".."), "public");

await mkdir(join(PUBLIC, "brand"), {recursive: true});
await writeFile(join(PUBLIC, "favicon.svg"), `${spriteSvg()}\n`);
await writeFile(join(PUBLIC, "brand/termicolor-512.svg"), `${spriteSvg({scale: 16})}\n`);
console.log("✓ brand assets written");
