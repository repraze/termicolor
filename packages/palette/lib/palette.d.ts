import { type Hex } from "./color.ts";
import { type AccentSet } from "./derive.ts";
import { type AccentName, type ModeName, NEUTRALS } from "./seeds.ts";
/** Semantic roles. Ports should map these, not raw neutrals. */
export type Roles = {
    bg: Hex;
    bgSunken: Hex;
    bgRaised: Hex;
    bgHover: Hex;
    border: Hex;
    borderStrong: Hex;
    guide: Hex;
    guideActive: Hex;
    fg: Hex;
    fgSoft: Hex;
    fgMuted: Hex;
    fgDisabled: Hex;
    accent: Hex;
    onAccent: Hex;
    accentTint: Hex;
    accentBright: Hex;
    accentFill: Hex;
    onAccentFill: Hex;
    cursor: Hex;
    selection: Hex;
    selectionInactive: Hex;
    findMatch: Hex;
    focusRing: Hex;
    shadow: Hex;
    matchActive: Hex;
    onMatchActive: Hex;
    titlebar: Hex;
    tabActive: Hex;
    tabActiveFg: Hex;
    tabIndicator: Hex;
    tabInactive: Hex;
    tabInactiveFg: Hex;
    danger: Hex;
    warning: Hex;
    success: Hex;
    info: Hex;
    hint: Hex;
    added: Hex;
    removed: Hex;
    modified: Hex;
    renamed: Hex;
    conflict: Hex;
    ignored: Hex;
};
/** File kinds for ls / eza / file trees. */
export type Files = Record<"directory" | "symlink" | "brokenLink" | "executable" | "archive" | "image" | "video" | "audio" | "document" | "config" | "source" | "temp", Hex>;
export type Ansi = Record<"black" | "red" | "green" | "yellow" | "blue" | "magenta" | "cyan" | "white" | "brightBlack" | "brightRed" | "brightGreen" | "brightYellow" | "brightBlue" | "brightMagenta" | "brightCyan" | "brightWhite", Hex>;
/** Syntax roles - matches what repraze.com renders. */
export type Syntax = Record<"keyword" | "function" | "type" | "string" | "number" | "constant" | "regexp" | "escape" | "comment" | "tag" | "attribute" | "property" | "variable" | "operator" | "punctuation" | "heading" | "link" | "invalid" | "parameter" | "builtin" | "bracket1" | "bracket2" | "bracket3" | "bracket4" | "bracket5" | "bracket6", Hex>;
/** "high" keeps every accent but flattens surfaces and swaps muted borders for bright ones. */
export type Contrast = "normal" | "high";
export type ModeId = ModeName | `${ModeName}-hc`;
export type Mode = {
    /** Unique per variant: `dark`, `light`, `dark-hc`, `light-hc`. */
    id: ModeId;
    name: ModeName;
    type: "dark" | "light";
    contrast: Contrast;
    /** Text tier: readable on bg. Use for colored text, icons, borders. */
    accents: AccentSet;
    /** Text on a solid `accents` fill. */
    on: AccentSet;
    /** Fill tier: vivid solid surfaces (buttons, badges, swatches, powerline segments). */
    fills: AccentSet;
    /** Text on a `fills` surface. */
    onFill: AccentSet;
    /** Tint tier: opaque washes behind fg text (badges, diff lines, selected rows). */
    tints: AccentSet;
    /** ANSI 9-14 and hover states. */
    brights: AccentSet;
    neutrals: typeof NEUTRALS;
    /** Accent-dependent roles (`accent`, `cursor`, `selection`, ...) are those of the palette's accent. */
    roles: Roles;
    /** The accent-dependent roles for every accent, to switch accent without rebuilding. */
    accentRoles: Record<AccentName, AccentRoles>;
    ansi: Ansi;
    /** ANSI faint/dim (SGR 2): every slot pulled toward bg by one rule. */
    ansiDim: Ansi;
    syntax: Syntax;
    files: Files;
};
export type Palette = {
    name: "Termicolor";
    defaultAccent: AccentName;
    modes: Record<ModeName, Mode>;
    /** Same accents and syntax as `modes`; one flat surface, bright borders, stronger secondary text. */
    highContrast: Record<ModeName, Mode>;
};
/** Roles that follow the chosen accent. Switching accent swaps exactly these (see `.accent-*` in palette.css). */
export declare const ACCENT_ROLES: readonly ["accent", "onAccent", "accentTint", "accentBright", "accentFill", "onAccentFill", "cursor", "selection", "selectionInactive", "focusRing", "tabIndicator"];
export type AccentRoles = Pick<Roles, (typeof ACCENT_ROLES)[number]>;
/**
 * Builds the palette around one accent. Termicolor itself is red; consumers pick their own
 * (repraze.com: purple, the UI library: pink) here for generated files, or with an
 * `.accent-<name>` class at runtime in CSS.
 */
export declare function createPalette({ accent }?: {
    accent?: AccentName;
}): Palette;
export declare const palette: Palette;
/** Every variant, normal first: dark, light, dark-hc, light-hc. */
export declare function allModes(p?: Palette): Mode[];
//# sourceMappingURL=palette.d.ts.map