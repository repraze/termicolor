import {ACCENTS, type Mode, palette} from "@repraze/termicolor";
import type {HighlighterCore, ThemeRegistration} from "shiki/core";

import {tokenColors} from "../../../../ports/vscode/token-colors.ts";

const kebab = (s: string) => s.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);

/**
 * One shiki theme that follows whatever mode scope it renders in. The VS Code token rules are run
 * against a "sentinel" mode whose every color is a unique placeholder hex, and each placeholder is
 * then swapped for its CSS variable via `colorReplacements`. Same rules as the editor, and any
 * .light/.dark/.hc scope recolors it with no re-highlight.
 */
export function cssVarTheme(): {theme: ThemeRegistration; replacements: Record<string, string>} {
    const replacements: Record<string, string> = {};
    let next = 1;
    const sentinel = (cssVar: string) => {
        const hex = `#${(next++).toString(16).padStart(6, "0")}`;
        replacements[hex] = `var(${cssVar})`;
        return hex;
    };
    const base = palette.modes.dark;
    const mode: Mode = {
        ...base,
        accents: Object.fromEntries(ACCENTS.map((n) => [n, sentinel(`--tc-${n}`)])) as Mode["accents"],
        roles: Object.fromEntries(
            Object.keys(base.roles).map((k) => [k, sentinel(`--tc-${kebab(k)}`)]),
        ) as Mode["roles"],
    };
    const theme: ThemeRegistration = {
        name: "termicolor",
        type: "dark",
        colors: {"editor.background": mode.roles.bg, "editor.foreground": mode.roles.fg},
        tokenColors: tokenColors(mode),
    };
    return {theme, replacements};
}

const LANGS = {
    css: () => import("shiki/langs/css.mjs"),
    fish: () => import("shiki/langs/fish.mjs"),
    ini: () => import("shiki/langs/ini.mjs"),
    json: () => import("shiki/langs/json.mjs"),
    lua: () => import("shiki/langs/lua.mjs"),
    powershell: () => import("shiki/langs/powershell.mjs"),
    shellscript: () => import("shiki/langs/shellscript.mjs"),
    toml: () => import("shiki/langs/toml.mjs"),
    tsx: () => import("shiki/langs/tsx.mjs"),
    xml: () => import("shiki/langs/xml.mjs"),
    yaml: () => import("shiki/langs/yaml.mjs"),
} as const;
export type Lang = keyof typeof LANGS | "text";

const EXTENSIONS: Record<string, Lang> = {
    css: "css",
    fish: "fish",
    conf: "ini",
    dconf: "ini",
    gitconfig: "ini",
    theme: "ini",
    json: "json",
    lua: "lua",
    ps1: "powershell",
    sh: "shellscript",
    bash: "shellscript",
    zsh: "shellscript",
    toml: "toml",
    ts: "tsx",
    tsx: "tsx",
    js: "tsx",
    xml: "xml",
    svg: "xml",
    plist: "xml",
    itermcolors: "xml",
    tmtheme: "xml",
    yml: "yaml",
    yaml: "yaml",
};

/** Language for a port file or a markdown fence tag. Extensionless files (ghostty themes) are `key = value`. */
export function langFor(fileOrTag: string): Lang {
    const name = fileOrTag.split("/").pop()!.toLowerCase();
    if (name in LANGS) {
        return name as Lang;
    }
    const aliases: Record<string, Lang> = {
        bash: "shellscript",
        sh: "shellscript",
        zsh: "shellscript",
        pwsh: "powershell",
    };
    if (name in aliases) {
        return aliases[name]!;
    }
    if (!name.includes(".")) {
        return EXTENSIONS[name] ?? "ini";
    }
    return EXTENSIONS[name.split(".").pop()!] ?? "text";
}

let highlighter: Promise<HighlighterCore> | undefined;
const {theme, replacements} = cssVarTheme();

async function getHighlighter(): Promise<HighlighterCore> {
    highlighter ??= (async () => {
        const [{createHighlighterCore}, {createJavaScriptRegexEngine}] = await Promise.all([
            import("shiki/core"),
            import("shiki/engine/javascript"),
        ]);
        return createHighlighterCore({themes: [theme], langs: [], engine: createJavaScriptRegexEngine()});
    })();
    return highlighter;
}

/** Highlighted HTML (a <pre class="shiki">) colored with --tc-* variables. */
export async function highlight(code: string, lang: Lang): Promise<string> {
    const hl = await getHighlighter();
    if (lang !== "text" && !hl.getLoadedLanguages().includes(lang)) {
        await hl.loadLanguage((await LANGS[lang]()).default);
    }
    return hl.codeToHtml(code, {lang, theme: "termicolor", colorReplacements: replacements});
}
