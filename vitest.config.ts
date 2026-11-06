import {fileURLToPath, URL} from "node:url";

import {defineConfig} from "vitest/config";

/** One runner for the whole monorepo: palette math, port builders and site logic. */
export default defineConfig({
    resolve: {
        alias: {"@": fileURLToPath(new URL("./packages/site/src", import.meta.url))},
    },
    test: {
        include: ["packages/*/src/**/*.test.{ts,tsx}", "ports/**/*.test.ts"],
        exclude: ["**/node_modules/**", ".claude/**"],
    },
});
