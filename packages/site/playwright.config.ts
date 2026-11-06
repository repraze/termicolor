import {existsSync} from "node:fs";
import {homedir} from "node:os";
import {join} from "node:path";

import {defineConfig, devices} from "@playwright/test";

/**
 * WSL without sudo: Chromium's missing system libs (nss, nspr, asound) unpacked from the .debs with
 * `apt-get download` + `dpkg -x` into ~/.cache/pw-libs. Unused in CI, where `playwright install --with-deps` runs.
 */
const LOCAL_LIBS = join(homedir(), ".cache/pw-libs/root/usr/lib/x86_64-linux-gnu");
const launchOptions = existsSync(LOCAL_LIBS)
    ? {env: {...process.env, LD_LIBRARY_PATH: `${LOCAL_LIBS}:${LOCAL_LIBS}/nss`} as Record<string, string>}
    : {};

const PORT = 5173;

/**
 * E2E + visual checks against the Vite dev server (reused when already running).
 * `npm run e2e` runs the specs; `npm run snap` writes screenshots to e2e/.snaps/ for eyeballing.
 */
export default defineConfig({
    testDir: "e2e",
    outputDir: "e2e/.results",
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 1 : 0,
    reporter: process.env.CI ? "github" : "list",
    use: {
        baseURL: `http://localhost:${PORT}/termicolor/`,
        trace: "retain-on-failure",
        launchOptions,
    },
    projects: [{name: "chromium", use: {...devices["Desktop Chrome"], viewport: {width: 1280, height: 900}}}],
    webServer: {
        command: "npm run dev",
        url: `http://localhost:${PORT}/termicolor/`,
        reuseExistingServer: !process.env.CI,
        timeout: 60_000,
    },
});
