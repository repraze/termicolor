import {type Mode, tint, wash} from "@repraze/termicolor";

import {indent, rule, type Site, type Variable} from "../usercss.ts";

/** GitHub's own colors for one status: text, quiet background, strong fill and the two borders. */
function status(name: string, color: string, fill: string): Variable[] {
    return [
        [`--fgColor-${name}`, color],
        [`--bgColor-${name}-muted`, wash(color, "subtle")],
        [`--bgColor-${name}-emphasis`, fill],
        [`--borderColor-${name}-muted`, wash(color, "medium")],
        [`--borderColor-${name}-emphasis`, color],
    ];
}

/**
 * Code highlighting. GitHub reads both the camelCase `--prettylights-syntax-*` tokens and their older
 * `--color-prettylights-syntax-*` aliases, so each is set under both names.
 */
function prettylights({roles: r, syntax: s, accents: a, fills, onFill}: Mode): Variable[] {
    const tokens: [camel: string, kebab: string, value: string][] = [
        ["comment", "comment", s.comment],
        ["constant", "constant", s.constant],
        ["constantOtherReferenceLink", "constant-other-reference-link", s.link],
        ["entity", "entity", s.function],
        ["entityTag", "entity-tag", s.tag],
        ["keyword", "keyword", s.keyword],
        ["storageModifierImport", "storage-modifier-import", r.fg],
        ["string", "string", s.string],
        ["stringRegexp", "string-regexp", s.regexp],
        ["variable", "variable", s.parameter],
        ["bracketHighlighterAngle", "brackethighlighter-angle", s.punctuation],
        ["bracketHighlighterUnmatched", "brackethighlighter-unmatched", s.invalid],
        ["invalidIllegal-text", "invalid-illegal-text", s.invalid],
        ["invalidIllegal-bg", "invalid-illegal-bg", wash(s.invalid, "subtle")],
        ["carriageReturn-text", "carriage-return-text", onFill.red],
        ["carriageReturn-bg", "carriage-return-bg", fills.red],
        ["markup-heading", "markup-heading", s.heading],
        ["markup-list", "markup-list", a.yellow],
        ["markup-bold", "markup-bold", r.fg],
        ["markup-italic", "markup-italic", r.fg],
        // diff markup in code: fg text on a wash of the change color
        ["markup-inserted-text", "markup-inserted-text", r.fg],
        ["markup-inserted-bg", "markup-inserted-bg", wash(r.added, "subtle")],
        ["markup-deleted-text", "markup-deleted-text", r.fg],
        ["markup-deleted-bg", "markup-deleted-bg", wash(r.removed, "subtle")],
        ["markup-changed-text", "markup-changed-text", r.fg],
        ["markup-changed-bg", "markup-changed-bg", wash(r.modified, "subtle")],
        ["markup-ignored-text", "markup-ignored-text", r.ignored],
        ["markup-ignored-bg", "markup-ignored-bg", r.bgRaised],
        ["metaDiffRange", "meta-diff-range", r.info],
        ["sublimeLinterGutterMark", "sublimelinter-gutter-mark", r.borderStrong],
    ];
    return tokens.flatMap(([camel, kebab, value]): Variable[] => [
        [`--prettylights-syntax-${camel}`, value],
        [`--color-prettylights-syntax-${kebab}`, value],
    ]);
}

function variables(mode: Mode): Variable[] {
    const {roles: r, syntax: s, accents: a, fills, onFill, neutrals: n, ansi} = mode;
    const shadow = (rest: string) => `0 0 0 1px ${r.borderStrong}, ${rest}`;
    return [
        // surfaces: default is the page, muted the cards and box headers, inset the wells around them
        ["--bgColor-default", r.bg],
        ["--bgColor-muted", r.bgRaised],
        ["--bgColor-inset", r.bgSunken],
        ["--bgColor-disabled", r.bgRaised],
        ["--bgColor-inverse", r.fg],
        // neutral fills carry --fgColor-onEmphasis, which is dark like every fill's text
        ["--bgColor-emphasis", n[400]],
        ["--bgColor-neutral-emphasis", n[400]],
        ["--bgColor-neutral-muted", wash(r.fgMuted, "soft")],

        // text
        ["--fgColor-default", r.fg],
        ["--fgColor-muted", r.fgSoft],
        ["--fgColor-neutral", r.fgSoft],
        ["--fgColor-disabled", r.fgDisabled],
        ["--fgColor-link", s.link],
        // text on every *-emphasis fill: the fills are the vivid seeds in both modes, all with dark text
        ["--fgColor-onEmphasis", r.onAccentFill],
        ["--fgColor-onInverse", r.bg],

        // borders
        ["--borderColor-default", r.borderStrong],
        ["--borderColor-muted", r.border],
        ["--borderColor-emphasis", r.fgMuted],
        ["--borderColor-translucent", wash(r.fg, "subtle")],
        ["--borderColor-disabled", r.border],

        // accent and statuses (open/closed/draft/upsell alias these)
        ["--fgColor-accent", r.accent],
        ["--bgColor-accent-muted", wash(r.accent, "subtle")],
        ["--bgColor-accent-emphasis", r.accentFill],
        ["--borderColor-accent-muted", wash(r.accent, "medium")],
        ["--borderColor-accent-emphasis", r.accent],
        ...status("success", r.success, fills.green),
        ...status("attention", r.warning, fills.yellow),
        ...status("severe", a.orange, fills.orange),
        ...status("danger", r.danger, fills.red),
        ...status("done", a.purple, fills.purple),
        ...status("sponsors", a.pink, fills.pink),

        // selection, focus, search
        ["--selection-bgColor", r.selection],
        ["--focus-outline-color", r.focusRing],
        ["--focus-outlineColor", r.focusRing],
        ["--highlight-neutral-bgColor", r.findMatch],

        // header
        ["--header-bgColor", r.titlebar],
        ["--header-borderColor-divider", r.borderStrong],
        ["--header-fgColor-default", r.fgSoft],
        ["--header-fgColor-logo", r.fg],
        ["--headerSearch-bgColor", r.bgRaised],
        ["--headerSearch-borderColor", r.borderStrong],
        ["--page-header-bgColor", r.bg],

        // tabs: the current one gets an accent underline next to fg text
        ["--underlineNav-borderColor-active", r.accent],
        ["--underlineNav-borderColor-hover", r.borderStrong],

        // menus, popovers and selected rows: accent tint behind fg text
        ["--overlay-bgColor", r.bgRaised],
        ["--overlay-borderColor", r.borderStrong],
        ["--overlay-backdrop-bgColor", r.shadow],
        ["--selectMenu-bgColor-active", r.accentTint],
        ["--selectMenu-borderColor", r.border],
        ["--menu-bgColor-active", r.accentTint],
        ["--sideNav-bgColor-selected", r.accentTint],
        ["--tooltip-bgColor", r.fg],
        ["--tooltip-fgColor", r.bg],
        ["--shadow-floating-small", shadow(`0 6px 12px -3px ${r.shadow}, 0 6px 18px 0 ${r.shadow}`)],
        ["--shadow-floating-medium", shadow(`0 8px 16px -4px ${r.shadow}, 0 4px 32px -4px ${r.shadow}`)],
        ["--shadow-floating-large", shadow(`0 24px 48px 0 ${r.shadow}`)],
        ["--shadow-floating-xlarge", shadow(`0 32px 64px 0 ${r.shadow}`)],

        // controls: inputs, default buttons, checkboxes, toggles
        ["--control-bgColor-rest", r.bgRaised],
        ["--control-bgColor-hover", tint(r.fg, "faint", r.bgRaised)],
        ["--control-bgColor-active", tint(r.fg, "subtle", r.bgRaised)],
        ["--control-borderColor-rest", r.borderStrong],
        ["--control-borderColor-emphasis", r.fgMuted],
        ["--control-borderColor-selected", r.accent],
        ["--control-fgColor-rest", r.fg],
        ["--control-fgColor-placeholder", r.fgMuted],
        ["--control-iconColor-rest", r.fgSoft],
        ["--control-transparent-bgColor-hover", r.bgHover],
        ["--control-transparent-bgColor-active", wash(r.fg, "subtle")],
        ["--control-transparent-bgColor-selected", wash(r.fg, "subtle")],
        ["--control-checked-bgColor-rest", r.accentFill],
        ["--control-checked-bgColor-hover", r.accentBright],
        ["--control-checked-bgColor-active", r.accentBright],
        ["--control-checked-fgColor-rest", r.onAccentFill],
        ["--control-danger-fgColor-hover", r.danger],
        ["--controlTrack-bgColor-rest", r.bgSunken],
        ["--controlTrack-bgColor-hover", r.bgRaised],
        ["--controlTrack-bgColor-active", tint(r.fg, "subtle", r.bgRaised)],
        ["--controlKnob-bgColor-rest", r.bgRaised],
        ["--controlKnob-bgColor-checked", r.onAccentFill],

        // buttons: primary is the accent fill (GitHub's green), the rest follow the controls
        ["--button-primary-bgColor-rest", r.accentFill],
        ["--button-primary-bgColor-hover", r.accentBright],
        ["--button-primary-bgColor-active", r.accentBright],
        ["--button-primary-bgColor-disabled", wash(r.accentFill, "medium")],
        ["--button-primary-borderColor-disabled", "transparent"],
        ["--button-primary-fgColor-rest", r.onAccentFill],
        ["--button-primary-iconColor-rest", r.onAccentFill],
        ["--button-primary-fgColor-disabled", wash(r.onAccentFill, "strong")],
        ["--button-outline-bgColor-rest", r.bgRaised],
        ["--button-outline-fgColor-rest", r.accent],
        ["--button-outline-fgColor-hover", r.accentBright],
        ["--button-outline-bgColor-active", r.accentFill],
        ["--button-outline-fgColor-active", r.onAccentFill],
        ["--button-outline-fgColor-disabled", r.fgDisabled],
        ["--button-danger-fgColor-rest", r.danger],
        ["--button-danger-fgColor-disabled", r.fgDisabled],
        ["--button-danger-bgColor-hover", fills.red],
        ["--button-danger-fgColor-hover", onFill.red],
        ["--button-danger-iconColor-hover", onFill.red],
        ["--button-danger-fgColor-active", onFill.red],
        ["--button-inactive-bgColor", r.bgRaised],
        ["--button-inactive-fgColor", r.fgMuted],
        ["--button-star-iconColor", a.yellow],
        // reactions you've added: accent wash and border, fg text
        ["--reactionButton-selected-bgColor-rest", wash(r.accent, "subtle")],
        ["--reactionButton-selected-bgColor-hover", wash(r.accent, "soft")],
        ["--reactionButton-selected-fgColor-rest", r.fg],
        ["--reactionButton-selected-fgColor-hover", r.fg],

        // misc surfaces
        ["--avatar-shadow", `0 0 0 2px ${r.bg}`],
        ["--timelineBadge-bgColor", r.bgRaised],
        ["--skeletonLoader-bgColor", wash(r.fg, "faint")],
        ["--button-default-shadow-resting", "none"],

        // diffs: washes of the change color behind fg text, stronger on the gutter and changed words
        ["--diffBlob-additionLine-bgColor", wash(r.added, "subtle")],
        ["--diffBlob-additionNum-bgColor", wash(r.added, "soft")],
        ["--diffBlob-additionWord-bgColor", wash(r.added, "medium")],
        ["--diffBlob-deletionLine-bgColor", wash(r.removed, "subtle")],
        ["--diffBlob-deletionNum-bgColor", wash(r.removed, "soft")],
        ["--diffBlob-deletionWord-bgColor", wash(r.removed, "medium")],
        ["--diffBlob-hunkLine-bgColor", wash(r.info, "subtle")],
        ["--diffBlob-hunkLine-fgColor", r.fgSoft],
        ["--diffBlob-hunkNum-bgColor-rest", wash(r.info, "soft")],
        ["--diffBlob-hunkNum-bgColor-hover", r.accentFill],
        ["--diffBlob-hunkNum-fgColor-hover", r.onAccentFill],
        ["--diffBlob-emptyLine-bgColor", r.bgSunken],
        ["--diffBlob-emptyNum-bgColor", r.bgSunken],

        // code
        ...prettylights(mode),
        ["--codeMirror-syntax-fgColor-comment", s.comment],
        ["--codeMirror-syntax-fgColor-constant", s.constant],
        ["--codeMirror-syntax-fgColor-entity", s.function],
        ["--codeMirror-syntax-fgColor-keyword", s.keyword],
        ["--codeMirror-syntax-fgColor-storage", s.keyword],
        ["--codeMirror-syntax-fgColor-string", s.string],
        ["--codeMirror-syntax-fgColor-support", s.builtin],
        ["--codeMirror-syntax-fgColor-variable", s.parameter],
        ["--codeMirror-cursor-fgColor", r.cursor],
        ["--codeMirror-selection-bgColor", r.selection],
        ["--codeMirror-activeline-bgColor", r.bgHover],

        // terminal output in Actions logs
        ["--ansi-black", ansi.black],
        ["--ansi-red", ansi.red],
        ["--ansi-green", ansi.green],
        ["--ansi-yellow", ansi.yellow],
        ["--ansi-blue", ansi.blue],
        ["--ansi-magenta", ansi.magenta],
        ["--ansi-cyan", ansi.cyan],
        ["--ansi-white", ansi.white],
        ["--ansi-gray", ansi.brightBlack],
        ["--ansi-blackBright", ansi.brightBlack],
        ["--ansi-redBright", ansi.brightRed],
        ["--ansi-greenBright", ansi.brightGreen],
        ["--ansi-yellowBright", ansi.brightYellow],
        ["--ansi-blueBright", ansi.brightBlue],
        ["--ansi-magentaBright", ansi.brightMagenta],
        ["--ansi-cyanBright", ansi.brightCyan],
        ["--ansi-whiteBright", ansi.brightWhite],

        // contribution graph: green tints of the page, up to the full green
        ["--contribution-default-bgColor-0", r.border],
        ["--contribution-default-bgColor-1", tint(a.green, "soft", r.bg)],
        ["--contribution-default-bgColor-2", tint(a.green, "medium", r.bg)],
        ["--contribution-default-bgColor-3", tint(a.green, "strong", r.bg)],
        ["--contribution-default-bgColor-4", a.green],
        ["--contribution-default-borderColor-0", "transparent"],
    ];
}

/**
 * GitHub picks a theme per color mode: `data-color-mode` is `dark`, `light` or `auto` (follow the OS), and
 * `data-dark-theme` / `data-light-theme` name the theme used in each (`dark`, `dark_dimmed`, `light_high_contrast`...).
 * Any `dark*` theme gets the dark palette and any `light*` theme the light one, whichever mode slot it sits in.
 *
 * The attributes are doubled (`[a][a="x"]`) to outrank Primer's own theme selectors, which top out at three.
 */
function selector(colorMode: "dark" | "light" | "auto", slot: "dark" | "light", type: "dark" | "light"): string {
    const theme = `data-${slot}-theme`;
    return `[data-color-mode][data-color-mode="${colorMode}"][${theme}][${theme}^="${type}"]`;
}

function body(dark: Mode, light: Mode): string {
    const modes = [dark, light];
    // fixed modes, and `auto` before the OS says it prefers dark (GitHub uses the light slot then)
    const fixed = modes.map((mode) =>
        rule(
            [
                selector("dark", "dark", mode.type),
                selector("light", "light", mode.type),
                selector("auto", "light", mode.type),
            ],
            variables(mode),
        ),
    );
    // `auto` on a dark OS uses the dark slot; it comes last so it wins over the light-slot rule above
    const auto = modes.map((mode) => rule([selector("auto", "dark", mode.type)], variables(mode)));
    return [
        `/* Dark */`,
        fixed[0],
        "",
        `/* Light */`,
        fixed[1],
        "",
        `/* Auto: follow the OS */`,
        "@media (prefers-color-scheme: dark) {",
        indent(auto.join("\n\n")),
        "}",
    ].join("\n");
}

export const github: Site = {
    id: "github",
    name: "GitHub",
    description: "High contrast, bright, techy colors for GitHub, in GitHub's dark and light themes",
    matchers: ['domain("github.com")', 'domain("gist.github.com")'],
    body: (palette) => body(palette.modes.dark, palette.modes.light),
};
