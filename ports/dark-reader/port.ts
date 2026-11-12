import {type Mode, solid} from "@repraze/termicolor";
import {definePort, json} from "@termicolor/build";

/** The colors Dark Reader lets you pick for one scheme. */
function colors({roles: r}: Mode) {
    return {
        background: r.bg,
        text: r.fg,
        // Dark Reader wants opaque #rrggbb, so lay the translucent selection over the page background
        selection: solid(r.selection, r.bg),
        scrollbar: r.borderStrong,
    };
}

/**
 * A Dark Reader settings file: https://github.com/darkreader/darkreader/blob/main/src/defaults.ts
 * Import replaces the whole `theme` object, so every theme key is set (Dark Reader's defaults for the
 * non-color ones; `fontFamily` and `styleSystemControls` are platform defaults and refill on restart).
 * Selection and scrollbar colors are shared by both schemes; the default mode is dark, so they use dark.
 */
function settings(dark: Mode, light: Mode) {
    const d = colors(dark);
    const l = colors(light);
    return {
        theme: {
            mode: 1,
            brightness: 100,
            contrast: 100,
            grayscale: 0,
            sepia: 0,
            useFont: false,
            textStroke: 0,
            engine: "dynamicTheme",
            stylesheet: "",
            darkSchemeBackgroundColor: d.background,
            darkSchemeTextColor: d.text,
            lightSchemeBackgroundColor: l.background,
            lightSchemeTextColor: l.text,
            scrollbarColor: d.scrollbar,
            selectionColor: d.selection,
            lightColorScheme: "Default",
            darkColorScheme: "Default",
            immediateModify: false,
        },
    };
}

function table(dark: Mode, light: Mode): string {
    const d = colors(dark);
    const l = colors(light);
    const rows: [string, keyof typeof d][] = [
        ["Background color", "background"],
        ["Text color", "text"],
        ["Selection color", "selection"],
        ["Scrollbar color", "scrollbar"],
    ];
    return [
        "# Termicolor for Dark Reader",
        "",
        "Enter these in Dark Reader's Colors settings. Background and text are kept per scheme: set the dark",
        "column while the mode is Dark, then switch the mode to Light and set the light column. Selection and",
        "scrollbar are one setting for both schemes, so pick the column you browse in most.",
        "",
        "| Setting | Dark | Light |",
        "| --- | --- | --- |",
        ...rows.map(([label, key]) => `| ${label} | \`${d[key]}\` | \`${l[key]}\` |`),
        "",
    ].join("\n");
}

export default definePort({
    id: "dark-reader",
    name: "Dark Reader",
    category: "browser",
    description: "Background, text, selection and scrollbar colors for Dark Reader's dark and light schemes.",
    homepage: "https://darkreader.org",
    tags: ["darkreader", "extension", "chrome", "firefox", "edge", "safari", "browser"],
    install: `
**By hand (recommended):** open Dark Reader → **Settings** (or **See all options**) → **Colors** and type in the
values from \`colors.md\`. Background and text are stored per scheme: enter the dark values while the mode is
**Dark**, then switch to **Light** and enter the light values. These colors apply to the **Dynamic** engine.

**Import:** \`termicolor.json\` holds both schemes plus selection and scrollbar colors. In **Settings** →
**Advanced** → **Import Settings**, pick the file. Import is not a merge within the theme: it replaces Dark
Reader's whole global theme (brightness, contrast, sepia, grayscale, font and engine go back to defaults, mode to
Dark). Site lists, per-site themes and other settings are left alone. Use **Export Settings** first to keep a
backup.
`,
    build: ({modes: {dark, light}}) => [
        {path: "termicolor.json", contents: json(settings(dark, light))},
        {path: "colors.md", contents: table(dark, light)},
    ],
});
