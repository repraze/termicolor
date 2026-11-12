import {type Hex, type Mode, rgb, tint, wash} from "@repraze/termicolor";
import {definePort, json} from "@termicolor/build";

import pkg from "../../package.json" with {type: "json"};

/** `r, g, b` for Obsidian's `-rgb` variables (deprecated since 1.13, still read by older themes and plugins). */
function triple(hex: Hex): string {
    const {r, g, b} = rgb(hex.slice(0, 7));
    return `${r}, ${g}, ${b}`;
}

function variables({accents: a, brights, fills, tints, roles: r, syntax: s}: Mode): [string, string][] {
    return [
        // base scale: 00 is the page, 100 the text
        ["--color-base-00", r.bg],
        ["--color-base-05", r.bg],
        ["--color-base-10", r.bgSunken],
        ["--color-base-20", r.bgSunken],
        ["--color-base-25", r.bgRaised],
        ["--color-base-30", r.border],
        ["--color-base-35", r.borderStrong],
        ["--color-base-40", r.borderStrong],
        ["--color-base-50", r.fgMuted],
        ["--color-base-60", r.fgMuted],
        ["--color-base-70", r.fgSoft],
        ["--color-base-100", r.fg],

        // extended colors
        ...Object.entries(a).flatMap(([name, hex]): [string, string][] => [
            [`--color-${name}`, hex],
            [`--color-${name}-rgb`, triple(hex)],
        ]),

        // accent: set directly so it doesn't depend on --accent-h/s/l
        ["--color-accent", r.accent],
        ["--color-accent-1", r.accentBright],
        ["--color-accent-2", r.accentBright],

        // surfaces
        ["--background-primary", r.bg],
        ["--background-primary-alt", r.bgRaised],
        ["--background-secondary", r.bgSunken],
        ["--background-secondary-alt", r.bgRaised],
        ["--background-modifier-hover", r.bgHover],
        ["--background-modifier-active-hover", wash(r.accent, "subtle")],
        ["--background-modifier-border", r.border],
        ["--background-modifier-border-hover", r.borderStrong],
        ["--background-modifier-border-focus", r.accent],
        ["--background-modifier-error", fills.red],
        ["--background-modifier-error-rgb", triple(fills.red)],
        ["--background-modifier-error-hover", brights.red],
        ["--background-modifier-success", fills.green],
        ["--background-modifier-success-rgb", triple(fills.green)],
        ["--background-modifier-message", r.bgRaised],
        ["--background-modifier-form-field", r.bgRaised],

        // interactive
        ["--interactive-normal", r.bgRaised],
        ["--interactive-hover", tint(r.fg, "subtle", r.bgRaised)],
        ["--interactive-accent", r.accentFill],
        ["--interactive-accent-hover", r.accentBright],

        // text
        ["--text-normal", r.fg],
        ["--text-muted", r.fgSoft],
        ["--text-faint", r.fgMuted],
        ["--text-on-accent", r.onAccentFill],
        ["--text-on-accent-inverted", r.onAccentFill],
        ["--text-error", r.danger],
        ["--text-warning", r.warning],
        ["--text-success", r.success],
        ["--text-accent", r.accent],
        ["--text-accent-hover", r.accentBright],
        ["--text-selection", r.selection],
        // ==highlight==: an opaque tint behind fg text
        ["--text-highlight-bg", tints.yellow],
        ["--text-highlight-bg-rgb", triple(tints.yellow)],
        ["--caret-color", r.cursor],
        ["--bold-color", r.fg],
        ["--italic-color", r.fg],

        // headings
        ...[1, 2, 3, 4, 5, 6].map((n): [string, string] => [`--h${n}-color`, s.heading]),

        // links
        ["--link-color", s.link],
        ["--link-color-hover", brights.blue],
        ["--link-external-color", s.link],
        ["--link-external-color-hover", brights.blue],
        ["--link-unresolved-color", s.link],
        ["--link-unresolved-decoration-color", wash(s.link, "medium")],

        // code
        ["--code-background", r.bgSunken],
        ["--code-normal", r.fg],
        ["--code-comment", s.comment],
        ["--code-function", s.function],
        ["--code-important", s.escape],
        ["--code-keyword", s.keyword],
        ["--code-operator", s.operator],
        ["--code-property", s.property],
        ["--code-punctuation", s.punctuation],
        ["--code-string", s.string],
        ["--code-tag", s.tag],
        ["--code-value", s.number],

        // blocks
        ["--blockquote-border-color", r.accent],
        ["--hr-color", r.border],
        ["--list-marker-color", r.fgSoft],
        ["--list-marker-color-hover", r.fg],
        ["--list-marker-color-collapsed", r.accent],
        ["--indentation-guide-color", r.guide],
        ["--indentation-guide-color-active", r.guideActive],

        // checkboxes
        ["--checkbox-color", r.accentFill],
        ["--checkbox-color-hover", r.accentBright],
        ["--checkbox-border-color", r.borderStrong],
        ["--checkbox-border-color-hover", r.accent],
        ["--checkbox-marker-color", r.onAccentFill],

        // tags: fg text on an accent wash, colored by the wash and its border
        ["--tag-color", r.fg],
        ["--tag-color-hover", r.fg],
        ["--tag-background", wash(r.accent, "subtle")],
        ["--tag-background-hover", wash(r.accent, "soft")],
        ["--tag-border-color", wash(r.accent, "medium")],
        ["--tag-border-color-hover", r.accent],

        // tables
        ["--table-border-color", r.border],
        ["--table-header-border-color", r.border],
        ["--table-header-background", r.bgSunken],
        ["--table-header-background-hover", r.bgHover],
        ["--table-header-color", r.fg],
        ["--table-row-background-hover", r.bgHover],
        ["--table-row-alt-background-hover", r.bgHover],
        ["--table-selection", r.selection],
        ["--table-selection-border-color", r.accent],
        ["--table-drag-handle-color", r.fgMuted],
        ["--table-drag-handle-color-active", r.onAccentFill],
        ["--table-drag-handle-background-active", r.accentFill],

        // graph
        ["--graph-line", r.borderStrong],
        ["--graph-node", r.fgSoft],
        ["--graph-node-unresolved", r.fgMuted],
        ["--graph-node-focused", r.accent],
        ["--graph-node-tag", a.green],
        ["--graph-node-attachment", a.yellow],
        ["--graph-text", r.fg],

        // window chrome
        ["--titlebar-background", r.titlebar],
        ["--titlebar-background-focused", r.titlebar],
        ["--titlebar-border-color", r.border],
        ["--titlebar-text-color", r.fgSoft],
        ["--titlebar-text-color-focused", r.fg],
        ["--ribbon-background", r.bgSunken],
        ["--ribbon-background-collapsed", r.bgSunken],
        ["--status-bar-background", r.bgSunken],
        ["--status-bar-border-color", r.border],
        ["--status-bar-text-color", r.fgSoft],
        ["--modal-background", r.bg],
        ["--modal-border-color", r.borderStrong],
        ["--divider-color", r.border],
        ["--divider-color-hover", r.accent],
        ["--scrollbar-bg", "transparent"],
        ["--scrollbar-thumb-bg", r.borderStrong],
        ["--scrollbar-active-thumb-bg", r.fgMuted],
        ["--icon-color", r.fgSoft],
        ["--icon-color-hover", r.fg],
        ["--icon-color-active", r.accent],
        ["--icon-color-focused", r.fg],
        ["--search-icon-color", r.fgMuted],

        // tabs: the active tab merges into the note below it
        ["--tab-container-background", r.tabInactive],
        ["--tab-background-active", r.tabActive],
        ["--tab-text-color", r.tabInactiveFg],
        ["--tab-text-color-active", r.tabActiveFg],
        ["--tab-text-color-focused", r.tabInactiveFg],
        ["--tab-text-color-focused-active", r.tabActiveFg],
        ["--tab-text-color-focused-active-current", r.tabActiveFg],
        ["--tab-text-color-focused-highlighted", r.accent],
        ["--tab-divider-color", r.border],
        ["--tab-outline-color", r.border],

        // file explorer and other nav trees: hover washes, the open file gets the accent tint
        ["--nav-item-color", r.fgSoft],
        ["--nav-item-color-hover", r.fg],
        ["--nav-item-color-active", r.fg],
        ["--nav-item-color-selected", r.fg],
        ["--nav-item-color-highlighted", r.accent],
        ["--nav-item-background-hover", r.bgHover],
        ["--nav-item-background-active", r.accentTint],
        ["--nav-item-background-selected", r.selection],
        ["--nav-item-border-color-active", r.accent],
        ["--nav-heading-color", r.fg],
        ["--nav-heading-color-hover", r.fg],
        ["--nav-heading-color-collapsed", r.fgMuted],
        ["--nav-collapse-icon-color", r.fgMuted],
        ["--nav-collapse-icon-color-collapsed", r.fgMuted],
        ["--nav-collapse-icon-color-hover", r.fg],
        ["--nav-indentation-guide-color", r.guide],
    ];
}

const block = (selector: string, mode: Mode) =>
    [`${selector} {`, ...variables(mode).map(([name, value]) => `    ${name}: ${value};`), "}"].join("\n");

function themeCss(dark: Mode, light: Mode): string {
    return `/* Termicolor for Obsidian - high contrast, bright, techy colors. Generated by termicolor, do not edit. */

${block(".theme-dark", dark)}

${block(".theme-light", light)}
`;
}

export default definePort({
    id: "obsidian",
    name: "Obsidian",
    category: "app",
    description: "Notes app theme",
    homepage: "https://obsidian.md/",
    tags: ["notes", "markdown", "knowledge base"],
    install: `
Copy the \`Termicolor\` folder into your vault's themes folder, \`<vault>/.obsidian/themes/\`, so you end up
with \`<vault>/.obsidian/themes/Termicolor/theme.css\` and \`manifest.json\`. Then open
**Settings → Appearance → Themes**, pick *Termicolor*, and choose *Dark* or *Light* under **Base color scheme**
(or *Adapt to system*). Both modes ship in the one theme.

The theme sets the accent color itself, so the **Accent color** setting has no effect while it's active.
`,
    build: (palette) => [
        {
            path: "Termicolor/manifest.json",
            contents: json({
                name: "Termicolor",
                version: pkg.version,
                minAppVersion: "1.0.0",
                author: "repraze",
                authorUrl: "https://github.com/repraze/termicolor",
            }),
        },
        {path: "Termicolor/theme.css", contents: themeCss(palette.modes.dark, palette.modes.light)},
    ],
});
