import {lstatSync} from "node:fs";
import {copyFile} from "node:fs/promises";
import {join} from "node:path";
import {fileURLToPath, URL} from "node:url";

import {themeScript} from "@repraze/kernelkit/theme";
import tailwindcss from "@tailwindcss/vite";
import {tanstackRouter} from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import {defaultClientConditions, defineConfig, type Plugin} from "vite";

import {LEGACY_THEME_MIGRATION, SITE_THEME, THEME_KEY} from "./src/lib/theme.ts";

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

/**
 * Inline the pre-paint theme script (KernelKit's, with the site's key and defaults) so the stored mode,
 * contrast, accent and radius apply before first paint; the legacy migration runs first.
 */
function themeScriptPlugin(): Plugin {
    return {
        name: "termicolor-theme-script",
        transformIndexHtml(html) {
            const script = themeScript({storageKey: THEME_KEY, defaults: SITE_THEME});
            return html.replace(
                "<!-- termicolor:theme-script -->",
                `<script>${LEGACY_THEME_MIGRATION}\n${script}</script>`,
            );
        },
    };
}

/**
 * `npm link @repraze/kernelkit` (a symlink to a kernelkit checkout): serve kernelkit from its TypeScript
 * sources (its "@repraze/source" exports condition), unbundled, so edits there hot-reload here.
 * Installed from npm: use its built dist like any dependency, pre-bundled with its CJS deps.
 */
const kernelkitLinked = (() => {
    try {
        return lstatSync(
            fileURLToPath(new URL("../../node_modules/@repraze/kernelkit", import.meta.url)),
        ).isSymbolicLink();
    } catch {
        return false;
    }
})();

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
    plugins: [
        tanstackRouter({target: "react", autoCodeSplitting: true}),
        react(),
        tailwindcss(),
        themeScriptPlugin(),
        spaFallback(),
    ],
    resolve: {
        alias: {"@": fileURLToPath(new URL("./src", import.meta.url))},
        conditions: [...(kernelkitLinked ? ["@repraze/source"] : []), ...defaultClientConditions],
        // a linked kernelkit sits outside this tree: force one copy of React-context packages
        dedupe: ["react", "react-dom", "@base-ui/react", "@tanstack/react-virtual", "cmdk", "lucide-react"],
    },
    optimizeDeps: kernelkitLinked ? {exclude: ["@repraze/kernelkit"]} : {},
});
