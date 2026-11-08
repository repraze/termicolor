import {copyFile} from "node:fs/promises";
import {join} from "node:path";
import {fileURLToPath, URL} from "node:url";

import tailwindcss from "@tailwindcss/vite";
import {tanstackRouter} from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import {defaultClientConditions, defineConfig, type Plugin} from "vite";

/** GitHub Pages has no SPA rewrites: serve the app for unknown paths so deep links work. */
function spaFallback(): Plugin {
    return {
        name: "spa-404-fallback",
        apply: "build",
        async writeBundle({dir}) {
            if (dir) {
                await copyFile(join(dir, "index.html"), join(dir, "404.html"));
            }
        },
    };
}

// Served at the root locally; the Pages workflow sets BASE_PATH=/<repo>/ (like kernelkit).
export default defineConfig({
    base: process.env.BASE_PATH ?? "/",
    // Fixed port so the suite's doc sites run side by side (termicolor 5170, kernelkit 5175, nullsec 5199).
    server: {port: 5170, strictPort: true},
    define: {
        // Cache-busts data files (registry, catalog, thumbnails, SVGs) per deploy: GitHub Pages caches
        // everything for 10 min, and an old catalog next to new thumbnails shows broken images.
        "import.meta.env.VITE_BUILD_ID": JSON.stringify(process.env.GITHUB_SHA?.slice(0, 12) ?? "dev"),
    },
    plugins: [tanstackRouter({target: "react", autoCodeSplitting: true}), react(), tailwindcss(), spaFallback()],
    resolve: {
        alias: {"@": fileURLToPath(new URL("./src", import.meta.url))},
        // Kernelkit from its TypeScript sources (its "@repraze/source" exports condition): with
        // `npm link @repraze/kernelkit`, edits in the kernelkit checkout hot-reload here.
        conditions: ["@repraze/source", ...defaultClientConditions],
        // a linked kernelkit sits outside this tree: force one copy of React-context packages
        dedupe: ["react", "react-dom", "@base-ui/react", "@tanstack/react-virtual", "cmdk", "lucide-react"],
    },
    // served as source, not pre-bundled, so kernelkit edits are seen
    optimizeDeps: {exclude: ["@repraze/kernelkit"]},
});
