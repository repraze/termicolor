import {type Mode, rgb} from "@repraze/termicolor";
import {definePort, json} from "@termicolor/build";

import pkg from "../../package.json" with {type: "json"};

const arr = (hex: string) => {
    const {r, g, b} = rgb(hex);
    return [r, g, b];
};

/** Chrome theme manifest - https://developer.chrome.com/docs/extensions/reference/manifest/theme */
function manifest({type, roles: r}: Mode) {
    return {
        manifest_version: 3,
        name: `Termicolor ${type === "dark" ? "Dark" : "Light"}`,
        version: pkg.version,
        description: "High contrast, bright, techy color theme",
        theme: {
            colors: {
                frame: arr(r.titlebar),
                frame_inactive: arr(r.titlebar),
                frame_incognito: arr(r.titlebar),
                toolbar: arr(r.tabActive), // the active tab is drawn in the toolbar color
                toolbar_text: arr(r.fg),
                toolbar_button_icon: arr(r.fgSoft),
                tab_text: arr(r.tabActiveFg),
                tab_background_text: arr(r.tabInactiveFg),
                tab_background_text_inactive: arr(r.fgMuted),
                bookmark_text: arr(r.fgSoft),
                omnibox_background: arr(r.bgRaised),
                omnibox_text: arr(r.fg),
                ntp_background: arr(r.bgSunken),
                ntp_text: arr(r.fg),
                ntp_link: arr(r.accent),
                ntp_header: arr(r.bg),
                button_background: arr(r.bgRaised),
            },
            properties: {ntp_background_alignment: "bottom"},
        },
    };
}

export default definePort({
    id: "chrome",
    name: "Chrome & Edge",
    category: "browser",
    description: "Browser frame, tab strip, toolbar and new tab page colors for Chromium browsers.",
    homepage: "https://www.google.com/chrome",
    tags: ["chromium", "edge", "brave", "vivaldi", "browser"],
    install: `
1. Open \`chrome://extensions\` (or \`edge://extensions\`) and enable **Developer mode**.
2. **Load unpacked** → select \`dist/dark\` or \`dist/light\`.

Chrome keeps one theme at a time; loading the other replaces it.
`,
    build: (palette) => [
        {path: "dark/manifest.json", contents: json(manifest(palette.modes.dark))},
        {path: "light/manifest.json", contents: json(manifest(palette.modes.light))},
    ],
});
