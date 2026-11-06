import {definePort, json} from "@termicolor/build";
import {CATALOG, CATALOG_SIZES, FAMILIES, getGenerator, renderCatalog, SIZES} from "@termicolor/wallpapers";

export default definePort({
    id: "wallpapers",
    name: "Wallpapers",
    category: "wallpaper",
    description:
        "Abstract generated wallpapers: gradients, lines and patterns in the palette, dark and light. Seeded, reproducible SVG.",
    tags: ["background", "desktop", "svg", "gradient", "pattern", "abstract", "portrait", "phone"],
    install: `
Pick a file under \`dist/<mode>/<width>x<height>/\`: landscape \`1920x1080\`, \`2560x1440\`, \`3840x2160\` or portrait
\`1080x1920\`, \`1440x2560\`, \`2160x3840\`. Portrait files have their own layout, not a crop of landscape.
\`catalog.json\` lists every wallpaper with its generator, seed and parameters.

The files are SVG. Most desktops want a raster image, so convert once, e.g.
\`rsvg-convert dist/dark/3840x2160/flow-2.svg -o flow-2.png\` (librsvg), Inkscape's export, or open the SVG in a
browser and save a screenshot. PNG renders attached to GitHub releases are planned.

Generators, parameters and kept seeds are documented in
[\`packages/wallpapers/CATALOG.md\`](../../packages/wallpapers/CATALOG.md).
`,
    build: (palette) => {
        const files = renderCatalog(palette);
        const catalog = {
            families: FAMILIES,
            sizes: Object.fromEntries(CATALOG_SIZES.map((name) => [name, SIZES[name]])),
            wallpapers: CATALOG.map((entry) => {
                const generator = getGenerator(entry.generator);
                return {
                    id: entry.id,
                    generator: entry.generator,
                    name: generator.name,
                    family: generator.family,
                    seed: entry.seed,
                    params: {...generator.defaults, ...entry.params},
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
