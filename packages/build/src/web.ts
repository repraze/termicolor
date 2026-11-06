import {ACCENT_ROLES, ACCENTS, allModes, type Mode, oklch, type Palette, rgb} from "@termicolor/palette";

import {json, type PortFile} from "./port.ts";

const kebab = (s: string) => s.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);

function modeVars(mode: Mode): string[] {
    const vars: [string, string][] = [
        ...Object.entries(mode.accents).flatMap(([name, hex]): [string, string][] => [
            [name, hex],
            [`${name}-bright`, mode.brights[name as keyof typeof mode.brights]],
            [`${name}-on`, mode.on[name as keyof typeof mode.on]],
            [`${name}-fill`, mode.fills[name as keyof typeof mode.fills]],
            [`${name}-on-fill`, mode.onFill[name as keyof typeof mode.onFill]],
            [`${name}-tint`, mode.tints[name as keyof typeof mode.tints]],
        ]),
        ...Object.entries(mode.roles).map(([name, hex]): [string, string] => [kebab(name), hex]),
        ...Object.entries(mode.ansi).map(([name, hex]): [string, string] => [`ansi-${kebab(name)}`, hex]),
        ...Object.entries(mode.ansiDim).map(([name, hex]): [string, string] => [`ansi-dim-${kebab(name)}`, hex]),
        ...Object.entries(mode.syntax).map(([name, hex]): [string, string] => [`syntax-${name}`, hex]),
        ...Object.entries(mode.files).map(([name, hex]): [string, string] => [`file-${kebab(name)}`, hex]),
        // the accent-dependent roles for every accent; `.accent-<name>` points the live roles at these
        ...ACCENTS.flatMap((n) =>
            ACCENT_ROLES.map((role): [string, string] => [`accent-${n}-${kebab(role)}`, mode.accentRoles[n][role]]),
        ),
    ];
    return vars.map(([name, value]) => `    --tc-${name}: ${value};`);
}

/**
 * Every mode is a class scope, so any element can render in any mode (nested previews included):
 * `.light` / `.dark` set every variable; adding `.hc` on the same element overrides only what high
 * contrast changes. `:root` without a class is light.
 */
function paletteCss(palette: Palette): string {
    const neutrals = Object.entries(palette.modes.dark.neutrals).map(([step, hex]) => `    --tc-n-${step}: ${hex};`);
    const hcOverrides = (name: "dark" | "light") => {
        const base = new Set(modeVars(palette.modes[name]));
        return modeVars(palette.highContrast[name]).filter((line) => !base.has(line));
    };
    return [
        "/* Termicolor palette - generated, do not edit. Scopes: .light (default on :root), .dark, + .hc */",
        ":root {",
        ...neutrals,
        "}",
        "",
        ":root,",
        ".light {",
        "    color-scheme: light;",
        ...modeVars(palette.modes.light),
        "}",
        "",
        ".dark {",
        "    color-scheme: dark;",
        ...modeVars(palette.modes.dark),
        "}",
        "",
        ":root.hc:not(.dark),",
        ".light.hc {",
        ...hcOverrides("light"),
        "}",
        "",
        ".dark.hc {",
        ...hcOverrides("dark"),
        "}",
        "",
        "/* Accent override: put .accent-<name> on <html> (or any ancestor). Last, so it wins over mode scopes. */",
        ...ACCENTS.flatMap((n) => [
            `.accent-${n}:is(:root, .light, .dark),`,
            `.accent-${n} :is(.light, .dark) {`,
            ...ACCENT_ROLES.map((role) => `    --tc-${kebab(role)}: var(--tc-accent-${n}-${kebab(role)});`),
            "}",
            "",
        ]),
    ].join("\n");
}

/** Maps shadcn/ui tokens (and repraze.com `--tone-*` tokens) onto the palette vars. */
function shadcnCss(palette: Palette): string {
    const tones = Object.keys(palette.modes.dark.accents).flatMap((n) => [
        `    --tone-${n}: var(--tc-${n});`,
        `    --tone-${n}-foreground: var(--tc-${n}-on);`,
    ]);
    return `/* shadcn/ui tokens on Termicolor - generated, do not edit. Import after palette.css */
:root,
.light,
.dark {
    --background: var(--tc-bg-sunken);
    --foreground: var(--tc-fg);
    --card: var(--tc-bg);
    --card-foreground: var(--tc-fg);
    --popover: var(--tc-bg);
    --popover-foreground: var(--tc-fg);
    --primary: var(--tc-accent);
    --primary-foreground: var(--tc-on-accent);
    --secondary: var(--tc-bg-raised);
    --secondary-foreground: var(--tc-fg);
    --muted: var(--tc-bg-raised);
    --muted-foreground: var(--tc-fg-soft);
    --accent: var(--tc-accent-tint);
    --hover: var(--tc-bg-hover);
    --accent-foreground: var(--tc-fg);
    --destructive: var(--tc-danger);
    --border: var(--tc-border);
    --input: var(--tc-border-strong);
    --ring: var(--tc-accent);
    --chart-1: var(--tc-purple);
    --chart-2: var(--tc-blue);
    --chart-3: var(--tc-cyan);
    --chart-4: var(--tc-green);
    --chart-5: var(--tc-orange);
    --sidebar: var(--tc-bg-sunken);
    --sidebar-foreground: var(--tc-fg);
    --sidebar-primary: var(--tc-accent);
    --sidebar-primary-foreground: var(--tc-on-accent);
    --sidebar-accent: var(--tc-accent-tint);
    --sidebar-accent-foreground: var(--tc-fg);
    --sidebar-border: var(--tc-border);
    --sidebar-ring: var(--tc-accent);
${tones.join("\n")}
}
`;
}

/** palette.json: every color with hex, rgb and oklch so non-JS consumers don't need color math. */
function paletteJson(palette: Palette): string {
    const expand = (hex: string) => ({hex, rgb: rgb(hex.slice(0, 7)), oklch: oklch(hex.slice(0, 7))});
    const expandAll = (o: Record<string, string>) =>
        Object.fromEntries(Object.entries(o).map(([k, v]) => [k, expand(v)]));
    return json({
        name: palette.name,
        defaultAccent: palette.defaultAccent,
        modes: Object.fromEntries(
            allModes(palette).map((m) => [
                m.id,
                {
                    type: m.type,
                    contrast: m.contrast,
                    accents: expandAll(m.accents),
                    brights: expandAll(m.brights),
                    on: expandAll(m.on),
                    fills: expandAll(m.fills),
                    onFill: expandAll(m.onFill),
                    tints: expandAll(m.tints),
                    files: m.files,
                    accentRoles: m.accentRoles,
                    neutrals: expandAll(m.neutrals),
                    roles: m.roles,
                    ansi: m.ansi,
                    ansiDim: m.ansiDim,
                    syntax: m.syntax,
                },
            ]),
        ),
    });
}

export function buildWeb(palette: Palette): PortFile[] {
    return [
        {path: "palette.json", contents: paletteJson(palette)},
        {path: "palette.css", contents: paletteCss(palette)},
        {path: "shadcn.css", contents: shadcnCss(palette)},
    ];
}
