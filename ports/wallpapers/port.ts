import {definePort, json} from "@termicolor/build";
import {
    CATALOG,
    CATALOG_SIZES,
    describeEntry,
    FAMILIES,
    getGenerator,
    renderCatalog,
    SIZES,
} from "@termicolor/wallpapers";

export default definePort({
    verified: {date: "2026-11-12"},
    id: "wallpapers",
    name: "Wallpapers",
    category: "wallpaper",
    description:
        "Abstract generated wallpapers: gradients, lines and patterns in the palette, dark and light. Seeded, reproducible SVG.",
    tags: ["background", "desktop", "svg", "gradient", "pattern", "abstract", "portrait", "phone"],
    install: `
**Easiest:** pick one in the gallery below and download it as **JPG** (the default) at 1080p, QHD or 4K. It's
rendered at full size in your browser. JPG works as a wallpaper everywhere, Windows included. Then right-click it,
and choose *Set as desktop background* (Windows), or set it in your desktop's settings.

**From the repo:** pick a file under \`dist/<mode>/<width>x<height>/\`: landscape \`1920x1080\`, \`2560x1440\`, \`3840x2160\` or portrait
\`1080x1920\`, \`1440x2560\`, \`2160x3840\`. Portrait files have their own layout, not a crop of landscape.
\`catalog.json\` lists every wallpaper with its generator, seed and parameters.

The repo files are SVG (small, exact, any size). To convert one yourself:
\`rsvg-convert dist/dark/3840x2160/flow-2.svg -o flow-2.png\` (librsvg) or Inkscape's export.

Generators, parameters and kept seeds are documented in
[\`packages/wallpapers/CATALOG.md\`](../../packages/wallpapers/CATALOG.md).
`,
    build: (palette) => {
        const files = renderCatalog(palette);
        const catalog = {
            families: FAMILIES,
            sizes: Object.fromEntries(CATALOG_SIZES.map((name) => [name, SIZES[name]])),
            wallpapers: CATALOG.map((entry) => {
                const {harmony, lead, params} = describeEntry(entry);
                return {
                    id: entry.id,
                    generator: entry.generator,
                    name: getGenerator(entry.generator).name,
                    family: getGenerator(entry.generator).family,
                    seed: entry.seed,
                    harmony,
                    lead,
                    // Resolved: the accents the seed picked, plus density and grain.
                    params,
                    files: files.filter((f) => f.entry === entry).map((f) => f.path),
                };
            }),
        };
        return [
            {path: "catalog.json", contents: json(catalog)},
            ...files.map(({path, contents}) => ({path, contents})),
        ];
    },
});
