import {type AccentName, ACCENTS, type Hex, type Mode, wash} from "@repraze/termicolor";
import {definePort, json} from "@termicolor/build";

import {syntax} from "./syntax.ts";

const TRANSPARENT = "#00000000";

const title = (mode: Mode) => `Termicolor ${mode.type === "dark" ? "Dark" : "Light"}`;

/** `status`, `status.background`, `status.border` for one of Zed's status colors. */
function status(name: string, color: Hex) {
    return {[name]: color, [`${name}.background`]: wash(color, "subtle"), [`${name}.border`]: color};
}

/** Collaborator colors: the theme accent first (it's also your own cursor and selection), then the rest. */
function players(mode: Mode, accent: AccentName) {
    const order = [accent, ...ACCENTS.filter((n) => n !== accent)];
    return order.map((n) => {
        const roles = mode.accentRoles[n];
        return {cursor: roles.cursor, selection: roles.selection, background: roles.accentFill};
    });
}

function style(mode: Mode, accent: AccentName) {
    const {accents: a, roles: r, ansi, ansiDim, syntax: s} = mode;
    // Zed's own hover washes are strong; the palette's `faint` would vanish on list rows (DESIGN.md §6)
    const hover = mode.contrast === "high" ? r.bgHover : wash(r.fg, "subtle");
    const pressed = wash(r.fg, "soft");
    // `accentTint` is paler than that hover in light mode; a selection-strength accent wash stays above it
    const selected = wash(r.accent, "soft");
    return {
        "background.appearance": "opaque",
        accents: [s.bracket1, s.bracket2, s.bracket3, s.bracket4, s.bracket5, s.bracket6],

        // surfaces
        background: r.bgSunken,
        "surface.background": r.bgSunken,
        "elevated_surface.background": r.bgRaised,
        "panel.background": r.bgSunken,
        "panel.focused_border": r.accent,
        "panel.indent_guide": r.guide,
        "panel.indent_guide_active": r.guideActive,
        "panel.indent_guide_hover": r.guideActive,
        "pane.focused_border": r.focusRing,
        "pane_group.border": r.border,
        "title_bar.background": r.titlebar,
        "title_bar.inactive_background": r.titlebar,
        "status_bar.background": r.bgSunken,
        "toolbar.background": r.bg,
        "tab_bar.background": r.bgSunken,
        "tab.active_background": r.tabActive,
        "tab.inactive_background": r.tabInactive,
        "drop_target.background": wash(r.accent, "subtle"),
        "drop_target.border": r.accent,

        // borders
        border: r.border,
        "border.variant": r.guide,
        "border.focused": r.accent,
        "border.selected": r.accent,
        "border.transparent": TRANSPARENT,
        "border.disabled": r.border,

        // text & icons
        text: r.fg,
        "text.muted": r.fgSoft,
        "text.placeholder": r.fgMuted,
        "text.disabled": r.fgDisabled,
        "text.accent": r.accent,
        icon: r.fg,
        "icon.muted": r.fgSoft,
        "icon.placeholder": r.fgMuted,
        "icon.disabled": r.fgDisabled,
        "icon.accent": r.accent,
        "link_text.hover": a.cyan,

        // elements: buttons, list rows, tabs
        "element.background": r.bgRaised,
        "element.hover": hover,
        "element.active": pressed,
        "element.selected": selected,
        "element.disabled": r.bgRaised,
        "element.selection_background": r.selection,
        "ghost_element.background": TRANSPARENT,
        "ghost_element.hover": hover,
        "ghost_element.active": pressed,
        "ghost_element.selected": selected,
        "ghost_element.disabled": TRANSPARENT,

        // editor
        "editor.background": r.bg,
        "editor.foreground": r.fg,
        "editor.gutter.background": r.bg,
        "editor.subheader.background": r.bgSunken,
        "editor.active_line.background": wash(r.fg, "faint"),
        "editor.highlighted_line.background": wash(r.accent, "subtle"),
        "editor.line_number": r.fgMuted,
        "editor.active_line_number": r.fg,
        "editor.hover_line_number": r.fgSoft,
        "editor.code_lens.foreground": r.fgMuted,
        "editor.debugger_active_line.background": wash(a.yellow, "subtle"),
        "editor.invisible": wash(r.fgMuted, "medium"),
        "editor.indent_guide": r.guide,
        "editor.indent_guide_active": r.guideActive,
        "editor.wrap_guide": r.guide,
        "editor.active_wrap_guide": r.guideActive,
        "editor.document_highlight.read_background": wash(a.blue, "subtle"),
        "editor.document_highlight.write_background": wash(a.blue, "soft"),
        "editor.document_highlight.bracket_background": wash(r.accent, "subtle"),
        "editor.diff_hunk.added.background": wash(r.added, "subtle"),
        "editor.diff_hunk.added.hollow_background": wash(r.added, "faint"),
        "editor.diff_hunk.added.hollow_border": wash(r.added, "medium"),
        "editor.diff_hunk.deleted.background": wash(r.removed, "subtle"),
        "editor.diff_hunk.deleted.hollow_background": wash(r.removed, "faint"),
        "editor.diff_hunk.deleted.hollow_border": wash(r.removed, "medium"),
        "search.match_background": r.findMatch,
        // Zed only paints a background under the current match, text keeps its syntax color, so
        // `onMatchActive` can't apply: the vivid orange fill, see-through enough to read code on.
        "search.active_match_background": wash(r.matchActive, "strong"),
        "debugger.accent": r.danger,

        // scrollbar
        "scrollbar.thumb.background": wash(r.fgMuted, "soft"),
        "scrollbar.thumb.hover_background": wash(r.fgMuted, "medium"),
        "scrollbar.thumb.active_background": wash(r.accent, "medium"),
        "scrollbar.thumb.border": TRANSPARENT,
        "scrollbar.track.background": TRANSPARENT,
        "scrollbar.track.border": TRANSPARENT,
        "minimap.thumb.background": wash(r.fgMuted, "soft"),
        "minimap.thumb.hover_background": wash(r.fgMuted, "medium"),
        "minimap.thumb.active_background": wash(r.accent, "medium"),
        "minimap.thumb.border": TRANSPARENT,

        // status
        ...status("error", r.danger),
        ...status("warning", r.warning),
        ...status("info", r.info),
        ...status("hint", r.hint),
        ...status("success", r.success),
        ...status("created", r.added),
        ...status("modified", r.modified),
        ...status("deleted", r.removed),
        ...status("renamed", r.renamed),
        ...status("conflict", r.conflict),
        ...status("ignored", r.ignored),
        ...status("hidden", r.fgMuted),
        ...status("unreachable", r.fgMuted),
        ...status("predictive", r.fgMuted),

        // git and diff (newer Zed; keys an older Zed doesn't know are ignored)
        "version_control.added": r.added,
        "version_control.modified": r.modified,
        "version_control.deleted": r.removed,
        "version_control.renamed": r.renamed,
        "version_control.conflict": r.conflict,
        "version_control.ignored": r.ignored,
        "version_control.word_added": wash(r.added, "medium"),
        "version_control.word_deleted": wash(r.removed, "medium"),
        "version_control.conflict_marker.ours": wash(a.green, "subtle"),
        "version_control.conflict_marker.theirs": wash(a.blue, "subtle"),

        // terminal
        "terminal.background": r.bgSunken,
        "terminal.foreground": r.fg,
        "terminal.bright_foreground": r.fg,
        "terminal.dim_foreground": r.fgSoft,
        "terminal.ansi.background": r.bgSunken,
        "terminal.ansi.black": ansi.black,
        "terminal.ansi.red": ansi.red,
        "terminal.ansi.green": ansi.green,
        "terminal.ansi.yellow": ansi.yellow,
        "terminal.ansi.blue": ansi.blue,
        "terminal.ansi.magenta": ansi.magenta,
        "terminal.ansi.cyan": ansi.cyan,
        "terminal.ansi.white": ansi.white,
        "terminal.ansi.bright_black": ansi.brightBlack,
        "terminal.ansi.bright_red": ansi.brightRed,
        "terminal.ansi.bright_green": ansi.brightGreen,
        "terminal.ansi.bright_yellow": ansi.brightYellow,
        "terminal.ansi.bright_blue": ansi.brightBlue,
        "terminal.ansi.bright_magenta": ansi.brightMagenta,
        "terminal.ansi.bright_cyan": ansi.brightCyan,
        "terminal.ansi.bright_white": ansi.brightWhite,
        "terminal.ansi.dim_black": ansiDim.black,
        "terminal.ansi.dim_red": ansiDim.red,
        "terminal.ansi.dim_green": ansiDim.green,
        "terminal.ansi.dim_yellow": ansiDim.yellow,
        "terminal.ansi.dim_blue": ansiDim.blue,
        "terminal.ansi.dim_magenta": ansiDim.magenta,
        "terminal.ansi.dim_cyan": ansiDim.cyan,
        "terminal.ansi.dim_white": ansiDim.white,

        players: players(mode, accent),
        syntax: syntax(mode),
    };
}

export function zedTheme(mode: Mode, accent: AccentName) {
    return {name: title(mode), appearance: mode.type, style: style(mode, accent)};
}

export default definePort({
    id: "zed",
    name: "Zed",
    category: "editor",
    description: "Dark and light Zed themes in one family: UI, git, terminal ANSI, collaborators and syntax.",
    homepage: "https://zed.dev",
    tags: ["rust", "editor", "tree-sitter"],
    install: `
Copy \`themes/termicolor.json\` into Zed's themes folder: \`~/.config/zed/themes/\` on Linux and macOS,
\`%APPDATA%\\Zed\\themes\` on Windows. Zed picks it up without a restart.

Pick **Termicolor Dark** or **Termicolor Light** with *theme selector: toggle* (\`cmd-k cmd-t\` / \`ctrl-k ctrl-t\`),
or follow the OS light/dark setting in \`settings.json\`:

\`\`\`json
{
    "theme": {
        "mode": "system",
        "light": "Termicolor Light",
        "dark": "Termicolor Dark"
    }
}
\`\`\`
`,
    build: (palette) => [
        {
            path: "themes/termicolor.json",
            contents: json({
                $schema: "https://zed.dev/schema/themes/v0.2.0.json",
                name: "Termicolor",
                author: "repraze",
                themes: [
                    zedTheme(palette.modes.dark, palette.defaultAccent),
                    zedTheme(palette.modes.light, palette.defaultAccent),
                ],
            }),
        },
    ],
});
