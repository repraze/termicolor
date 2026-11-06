import {definePort} from "@termicolor/build";
import {type Mode, tint} from "@termicolor/palette";

import {tokenColors} from "../vscode/token-colors.ts";
import {tmTheme} from "./tmtheme.ts";

const UUIDS = {
    dark: "5b7c0f1e-3a2d-4c8e-9f61-7d2a1e0b4c01",
    light: "5b7c0f1e-3a2d-4c8e-9f61-7d2a1e0b4c02",
};

/** Same token rules as the VS Code theme, so bat/delta highlight code exactly like the editor. */
function theme(mode: Mode): string {
    const {roles: r} = mode;
    return tmTheme({
        name: `Termicolor ${mode.name === "dark" ? "Dark" : "Light"}`,
        uuid: UUIDS[mode.name],
        globals: {
            background: r.bg,
            foreground: r.fg,
            caret: r.cursor,
            invisibles: r.fgDisabled,
            lineHighlight: r.bgHover,
            selection: r.selection,
            selectionBorder: r.selection,
            inactiveSelection: r.selectionInactive,
            findHighlight: r.findMatch,
            findHighlightForeground: r.fg,
            gutter: r.bg,
            gutterForeground: r.fgMuted,
            guide: r.guide,
            activeGuide: r.guideActive,
            stackGuide: r.guide,
            bracketsForeground: mode.syntax.bracket1,
            accent: r.accent,
            shadow: r.shadow,
        },
        rules: tokenColors(mode),
    });
}

/** A delta feature named `termicolor-<mode>`, enabled with `features = termicolor-dark`. */
function deltaFeature(mode: Mode): string {
    const {roles: r, accents: a, tints} = mode;
    return `[delta "termicolor-${mode.name}"]
    ${mode.type} = true
    syntax-theme = termicolor-${mode.name}
    file-style = bold "${a.purple}"
    file-decoration-style = "${r.borderStrong}" ul
    file-added-label = [+]
    file-modified-label = [~]
    file-removed-label = [-]
    file-renamed-label = [>]
    hunk-header-style = file line-number syntax
    hunk-header-decoration-style = "${r.borderStrong}" box
    hunk-header-file-style = "${a.blue}"
    hunk-header-line-number-style = "${r.fgSoft}"
    commit-style = "${a.yellow}"
    commit-decoration-style = "${r.borderStrong}" box ul
    zero-style = syntax
    minus-style = syntax "${tint(a.red, "subtle", r.bg)}"
    minus-non-emph-style = syntax "${tint(a.red, "subtle", r.bg)}"
    minus-emph-style = syntax "${tint(a.red, "medium", r.bg)}"
    minus-empty-line-marker-style = syntax "${tint(a.red, "subtle", r.bg)}"
    plus-style = syntax "${tint(a.green, "subtle", r.bg)}"
    plus-non-emph-style = syntax "${tint(a.green, "subtle", r.bg)}"
    plus-emph-style = syntax "${tint(a.green, "medium", r.bg)}"
    plus-empty-line-marker-style = syntax "${tint(a.green, "subtle", r.bg)}"
    whitespace-error-style = reverse "${r.danger}"
    line-numbers-minus-style = "${r.removed}"
    line-numbers-plus-style = "${r.added}"
    line-numbers-zero-style = "${r.fgMuted}"
    line-numbers-left-style = "${r.borderStrong}"
    line-numbers-right-style = "${r.borderStrong}"
    blame-palette = "${r.bg}" "${r.bgSunken}" "${r.bgRaised}"
    blame-code-style = syntax
    merge-conflict-begin-symbol = ~
    merge-conflict-end-symbol = ~
    merge-conflict-ours-diff-header-style = bold "${a.yellow}"
    merge-conflict-ours-diff-header-decoration-style = "${r.borderStrong}" box
    merge-conflict-theirs-diff-header-style = bold "${a.blue}"
    merge-conflict-theirs-diff-header-decoration-style = "${r.borderStrong}" box
    # restyles git's --color-moved output (set diff.colorMoved = default)
    map-styles = \\
        bold purple => syntax "${tints.purple}", \\
        bold blue => syntax "${tints.blue}", \\
        bold cyan => syntax "${tints.cyan}", \\
        bold yellow => syntax "${tints.yellow}"
`;
}

export default definePort({
    id: "bat",
    name: "bat",
    category: "cli",
    description: "TextMate themes for bat, also used by git-delta, plus a delta config with matching diff colors.",
    homepage: "https://github.com/sharkdp/bat",
    tags: ["delta", "git-delta", "tmtheme", "sublime", "syntect", "git", "diff"],
    install: `
### bat

\`\`\`sh
mkdir -p "$(bat --config-dir)/themes"
cp termicolor-dark.tmTheme termicolor-light.tmTheme "$(bat --config-dir)/themes/"
bat cache --build
bat --list-themes | grep -i termicolor
\`\`\`

Then pick the theme in \`$(bat --config-file)\` (or with \`BAT_THEME\`):

\`\`\`sh
--theme="termicolor-dark"
\`\`\`

bat 0.25+ can follow the terminal's background instead:

\`\`\`sh
--theme="auto"
--theme-dark="termicolor-dark"
--theme-light="termicolor-light"
\`\`\`

On Windows, \`bat --config-dir\` is usually \`%APPDATA%\\bat\`. Run the same copy and \`bat cache --build\` steps.

### git-delta

[delta](https://github.com/dandavison/delta) reads bat's theme cache, so install the bat themes first
(\`delta --list-syntax-themes\` should then list them). Copy \`delta.gitconfig\` somewhere stable
(e.g. \`~/.config/delta/termicolor.gitconfig\`) and include it from \`~/.gitconfig\`:

\`\`\`ini
[include]
    path = ~/.config/delta/termicolor.gitconfig

[core]
    pager = delta

[interactive]
    diffFilter = delta --color-only

[delta]
    features = termicolor-dark
    navigate = true
    # line-numbers = true
    # side-by-side = true

[merge]
    conflictStyle = zdiff3

[diff]
    colorMoved = default
\`\`\`

Use \`features = termicolor-light\` on a light terminal. Each feature sets \`syntax-theme\`, the
added/removed line and word backgrounds, line numbers, hunk headers, blame and merge-conflict styles.
`,
    build: (palette) => [
        {path: "termicolor-dark.tmTheme", contents: theme(palette.modes.dark)},
        {path: "termicolor-light.tmTheme", contents: theme(palette.modes.light)},
        {
            path: "delta.gitconfig",
            contents: `# Termicolor for git-delta - generated by https://github.com/repraze/termicolor\n# Needs the termicolor-dark / termicolor-light bat themes installed (bat cache --build).\n\n${deltaFeature(palette.modes.dark)}\n${deltaFeature(palette.modes.light)}`,
        },
    ],
});
