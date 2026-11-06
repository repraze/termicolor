import {definePort} from "@termicolor/build";
import {type Hex, type Mode, rgb} from "@termicolor/palette";

const ANSI_ORDER = [
    "black",
    "red",
    "green",
    "yellow",
    "blue",
    "magenta",
    "cyan",
    "white",
    "brightBlack",
    "brightRed",
    "brightGreen",
    "brightYellow",
    "brightBlue",
    "brightMagenta",
    "brightCyan",
    "brightWhite",
] as const;

/** iTerm2 color entries, keyed by the names iTerm2 writes into its own presets. */
function colors({ansi, roles: r}: Mode): [string, Hex, number?][] {
    return [
        ...ANSI_ORDER.map((name, i): [string, Hex] => [`Ansi ${i} Color`, ansi[name]]),
        ["Background Color", r.bg],
        ["Foreground Color", r.fg],
        ["Bold Color", r.fg],
        ["Cursor Color", r.cursor],
        ["Cursor Text Color", r.onAccent],
        // iTerm2 paints the selection opaque, so use the solid selection.
        ["Selection Color", r.selectionSolid],
        ["Selected Text Color", r.fg],
        ["Link Color", r.info],
        ["Badge Color", r.accent, 0.5],
        ["Cursor Guide Color", r.fg, 0.08],
        ["Tab Color", r.titlebar],
        ["Underline Color", r.accent],
    ];
}

function colorDict(hex: Hex, alpha = 1): string {
    const {r, g, b} = rgb(hex);
    const real = (n: number) => `<real>${n}</real>`;
    return `<dict>
\t\t<key>Alpha Component</key>
\t\t${real(alpha)}
\t\t<key>Blue Component</key>
\t\t${real(b / 255)}
\t\t<key>Color Space</key>
\t\t<string>sRGB</string>
\t\t<key>Green Component</key>
\t\t${real(g / 255)}
\t\t<key>Red Component</key>
\t\t${real(r / 255)}
\t</dict>`;
}

function plist(entries: [string, Hex, number?][]): string {
    const body = entries
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, hex, alpha]) => `\t<key>${key}</key>\n\t${colorDict(hex, alpha)}`)
        .join("\n");
    return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
${body}
</dict>
</plist>
`;
}

export default definePort({
    id: "iterm",
    name: "iTerm2",
    category: "terminal",
    description:
        "Color presets for the iTerm2 macOS terminal, plus a combined preset that follows the system light/dark appearance.",
    homepage: "https://iterm2.com",
    tags: ["macos", "itermcolors", "ansi"],
    install: `
1. Open *Settings → Profiles → Colors*.
2. Click **Color Presets… → Import…** and pick \`termicolor-dark.itermcolors\` (and/or \`termicolor-light.itermcolors\`).
3. Choose the imported preset from the same menu.

**Follow the system appearance:** tick *Use separate colors for light and dark mode* in the Colors tab,
then import and select \`termicolor.itermcolors\`. It carries both modes in one preset.
`,
    build: (palette) => {
        const {dark, light} = palette.modes;
        const both = [
            ...colors(dark).map(([k, ...v]): [string, Hex, number?] => [`${k} (Dark)`, ...v]),
            ...colors(light).map(([k, ...v]): [string, Hex, number?] => [`${k} (Light)`, ...v]),
        ];
        return [
            {path: "termicolor-dark.itermcolors", contents: plist(colors(dark))},
            {path: "termicolor-light.itermcolors", contents: plist(colors(light))},
            {path: "termicolor.itermcolors", contents: plist(both)},
        ];
    },
});
