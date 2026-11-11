import {fileURLToPath, URL} from "node:url";

import {faviconPlugin, spaFallback, suiteSourceConditions, themeScriptPlugin} from "@repraze/kernelkit/vite";
import tailwindcss from "@tailwindcss/vite";
import {tanstackRouter} from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import {defineConfig} from "vite";

import {markSvg} from "./src/brand/mark.ts";
import {LEGACY_THEME_MIGRATION, SITE_THEME, THEME_KEY} from "./src/lib/theme.ts";

// Served at the root locally; the Pages workflow sets BASE_PATH=/<repo>/ (like kernelkit).
export default defineConfig({
    base: process.env.BASE_PATH ?? "/",
    // Fixed port so the suite's doc sites run side by side (termicolor 5170, kernelkit 5175, glaze 5180, nullsec 5199).
    server: {port: 5170, strictPort: true},
    define: {
        // Cache-busts data files (registry, catalog, thumbnails, SVGs) per deploy: GitHub Pages caches
        // everything for 10 min, and an old catalog next to new thumbnails shows broken images.
        "import.meta.env.VITE_BUILD_ID": JSON.stringify(process.env.GITHUB_SHA?.slice(0, 12) ?? "dev"),
    },
    plugins: [
        // `npm link @repraze/kernelkit` (a symlink to a kernelkit checkout): served from its TypeScript sources,
        // so edits there hot-reload here; installed from npm, its built dist like any dependency
        suiteSourceConditions(["@repraze/kernelkit"], {
            dedupe: ["react", "react-dom", "@base-ui/react", "@tanstack/react-virtual", "cmdk", "lucide-react"],
        }),
        tanstackRouter({target: "react", autoCodeSplitting: true}),
        react(),
        tailwindcss(),
        // the kit's pre-paint theme script with the site's key and defaults; the legacy migration runs first
        themeScriptPlugin({storageKey: THEME_KEY, defaults: SITE_THEME, prelude: LEGACY_THEME_MIGRATION}),
        faviconPlugin(markSvg),
        spaFallback(),
    ],
    resolve: {
        alias: {"@": fileURLToPath(new URL("./src", import.meta.url))},
    },
});
