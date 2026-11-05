import {definePort, json} from "@termicolor/build";
import {CATALOG, CATALOG_SIZES, FAMILIES, getGenerator, renderCatalog, SIZES} from "@termicolor/wallpapers";

export default definePort({
    id: "wallpapers",
    name: "Wallpapers",
    category: "wallpaper",
    description:
        "Generated gradients, grids and circuit boards in the palette, dark and light. Seeded, reproducible SVG.",
    tags: ["background", "desktop", "svg", "gradient", "grid", "circuit", "pcb", "synthwave"],
    install: `
Pick a file under \`dist/<mode>/<width>x<height>/\`. \`3840x2160\` is 16:9 and scales cleanly to 1920×1080 and
2560×1440; \`3440x1440\` is 21:9 ultrawide. \`catalog.json\` lists every wallpaper with its generator, seed and
parameters.

The files are SVG. Most desktops want a raster image, so convert once, e.g.
\`rsvg-convert -w 3840 dist/dark/3840x2160/circuit-1.svg -o circuit-1.png\` (librsvg), Inkscape's export, or open
the SVG in a browser and save a screenshot. PNG renders attached to GitHub releases are planned.

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
