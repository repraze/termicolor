import {copyFile} from "node:fs/promises";
import {join} from "node:path";
import {fileURLToPath, URL} from "node:url";

import tailwindcss from "@tailwindcss/vite";
import {tanstackRouter} from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import {defineConfig, type Plugin} from "vite";

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

// GitHub Pages serves the site under /<repo>/; override with BASE_PATH for other hosts.
export default defineConfig({
    base: process.env.BASE_PATH ?? "/termicolor/",
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
    },
});
