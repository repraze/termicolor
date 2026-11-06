import {definePort} from "@termicolor/build";
import {DEFAULT_ACCENT, type Hex, type Mode, solid} from "@termicolor/palette";

type Gradient = [start: Hex, mid: Hex, end: Hex];

/** Every key of btop's `Default_theme` (src/btop_theme.cpp), with the comments btop's own themes use. */
function theme(mode: Mode): string {
    const {roles: r, accents: a, brights: b, fills, onFill} = mode;
    const line = (key: string, value: Hex) => `theme[${key}]="${value}"`;
    const gradient = (key: string, [start, mid, end]: Gradient) =>
        [line(`${key}_start`, start), line(`${key}_mid`, mid), line(`${key}_end`, end)].join("\n");

    const sections: [string, string][] = [
        ["Main background, empty for terminal default", line("main_bg", r.bg)],
        ["Main text color", line("main_fg", r.fg)],
        ["Title color for boxes", line("title", r.fg)],
        ["Highlight color for keyboard shortcuts", line("hi_fg", r.accent)],
        ["Background color of selected item in processes box", line("selected_bg", solid(r.selection, r.bg))],
        ["Foreground color of selected item in processes box", line("selected_fg", r.fg)],
        ["Color of inactive/disabled text", line("inactive_fg", r.fgMuted)],
        [
            "Color of text appearing on top of graphs, i.e uptime and current network graph scaling",
            line("graph_text", r.fgSoft),
        ],
        ["Background color of the percentage meters", line("meter_bg", r.borderStrong)],
        [
            "Misc colors for processes box including mini cpu graphs, details memory graph and details status text",
            line("proc_misc", a.cyan),
        ],
        ["CPU box outline color", line("cpu_box", r.accent)],
        ["Memory/disks box outline color", line("mem_box", a.green)],
        ["Net up/down box outline color", line("net_box", a.orange)],
        ["Processes box outline color", line("proc_box", a.blue)],
        ["Box divider line and small boxes line color", line("div_line", r.borderStrong)],
        ["Temperature graph colors", gradient("temp", [a.blue, a.purple, a.red])],
        ["CPU graph colors", gradient("cpu", [a.green, a.yellow, a.red])],
        ["Mem/Disk free meter", gradient("free", [a.green, b.green, b.green])],
        ["Mem/Disk cached meter", gradient("cached", [a.blue, b.blue, b.blue])],
        ["Mem/Disk available meter", gradient("available", [a.yellow, a.orange, a.orange])],
        ["Mem/Disk used meter", gradient("used", [a.pink, a.red, a.red])],
        ["Download graph colors", gradient("download", [a.blue, a.purple, a.pink])],
        ["Upload graph colors", gradient("upload", [a.green, a.yellow, a.orange])],
        ["Process box color gradient for threads, mem and cpu usage", gradient("process", [a.green, a.yellow, a.red])],
        ["Process list banner when paused", line("proc_pause_bg", fills.red)],
        ["Process list banner when following a process", line("proc_follow_bg", fills.blue)],
        [
            "Process list banner colors",
            [line("proc_banner_bg", fills[DEFAULT_ACCENT]), line("proc_banner_fg", onFill[DEFAULT_ACCENT])].join("\n"),
        ],
        ["Followed process", [line("followed_bg", fills.blue), line("followed_fg", onFill.blue)].join("\n")],
    ];

    return `# Theme: Termicolor ${mode.name === "dark" ? "Dark" : "Light"}
# By: https://github.com/repraze/termicolor (generated - do not edit)

${sections.map(([comment, body]) => `# ${comment}\n${body}`).join("\n\n")}
`;
}

export default definePort({
    id: "btop",
    name: "btop",
    category: "cli",
    description: "Resource monitor themes covering every btop theme key, graphs and meters included.",
    homepage: "https://github.com/aristocratos/btop",
    tags: ["btop++", "monitor", "tui"],
    install: `
Copy the theme files to the user themes folder:

\`\`\`sh
mkdir -p ~/.config/btop/themes   # or $XDG_CONFIG_HOME/btop/themes
cp termicolor-dark.theme termicolor-light.theme ~/.config/btop/themes/
\`\`\`

Then select one in \`~/.config/btop/btop.conf\`:

\`\`\`ini
color_theme = "termicolor-dark"
theme_background = True
truecolor = True
\`\`\`

Or pick it live from the options menu (\`o\`, then *Color theme*). Set \`theme_background = False\` to keep
your terminal's own background.
`,
    build: (palette) => [
        {path: "termicolor-dark.theme", contents: theme(palette.modes.dark)},
        {path: "termicolor-light.theme", contents: theme(palette.modes.light)},
    ],
});
