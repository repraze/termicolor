import {definePort, json} from "@termicolor/build";
import {flatten, type Mode} from "@termicolor/palette";

const upper = (hex: string) => hex.toUpperCase();

function scheme({type, roles: r, ansi}: Mode) {
    return {
        name: `Termicolor ${type === "dark" ? "Dark" : "Light"}`,
        background: upper(r.bg),
        foreground: upper(r.fg),
        cursorColor: upper(r.cursor),
        // WT draws the selection with its own translucency; give it the flattened tint.
        selectionBackground: upper(flatten(r.selection, r.bg)),
        black: upper(ansi.black),
        red: upper(ansi.red),
        green: upper(ansi.green),
        yellow: upper(ansi.yellow),
        blue: upper(ansi.blue),
        purple: upper(ansi.magenta),
        cyan: upper(ansi.cyan),
        white: upper(ansi.white),
        brightBlack: upper(ansi.brightBlack),
        brightRed: upper(ansi.brightRed),
        brightGreen: upper(ansi.brightGreen),
        brightYellow: upper(ansi.brightYellow),
        brightBlue: upper(ansi.brightBlue),
        brightPurple: upper(ansi.brightMagenta),
        brightCyan: upper(ansi.brightCyan),
        brightWhite: upper(ansi.brightWhite),
    };
}

function theme({type, roles: r}: Mode) {
    return {
        name: `Termicolor ${type === "dark" ? "Dark" : "Light"}`,
        tab: {
            background: `${upper(r.bg)}FF`,
            unfocusedBackground: `${upper(r.bgSunken)}FF`,
            showCloseButton: "always",
        },
        tabRow: {background: `${upper(r.bgSunken)}FF`, unfocusedBackground: `${upper(r.bgSunken)}FF`},
        window: {
            applicationTheme: type,
            useMica: false,
            frame: `${upper(r.borderStrong)}FF`,
            unfocusedFrame: `${upper(r.bgSunken)}FF`,
        },
    };
}

export default definePort({
    id: "windows-terminal",
    name: "Windows Terminal",
    category: "terminal",
    description: "Color schemes plus a matching window/tab theme for Windows Terminal.",
    homepage: "https://github.com/microsoft/terminal",
    tags: ["windows", "wt", "ansi"],
    install: `
**Option A - fragment (auto-loads):** copy \`termicolor.json\` to
\`%LOCALAPPDATA%\\Microsoft\\Windows Terminal\\Fragments\\termicolor\\termicolor.json\` and restart.
The schemes appear in *Settings → Color schemes*.

**Option B - settings.json:** paste the objects from \`schemes.json\` into \`"schemes"\` and from
\`themes.json\` into \`"themes"\`. Then set:

\`\`\`json
"profiles": {"defaults": {"colorScheme": "Termicolor Dark"}},
"theme": "Termicolor Dark"
\`\`\`
`,
    build: (palette) => {
        const modes = [palette.modes.dark, palette.modes.light];
        return [
            {path: "termicolor.json", contents: json({schemes: modes.map(scheme)})},
            {path: "schemes.json", contents: json(modes.map(scheme))},
            {path: "themes.json", contents: json(modes.map(theme))},
        ];
    },
});
