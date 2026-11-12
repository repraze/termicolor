import {type Ansi, type Hex, type Mode, solid, tint} from "@repraze/termicolor";

/** `.icls` colors are opaque 6-hex without `#`. A translucent role here is a bug: flatten it with `solid`. */
function hex(color: Hex): string {
    const value = color.replace(/^#/, "").toLowerCase();
    if (!/^[0-9a-f]{6}$/.test(value)) {
        throw new Error(`jetbrains: .icls needs an opaque color, got ${color}`);
    }
    return value;
}

/** EffectType ordinals as IntelliJ serializes them. */
const EFFECT = {box: 0, underline: 1, wave: 2, strikeout: 3, boldUnderline: 4, dotted: 5} as const;
/** FontType: plain 0, bold 1, italic 2, bold italic 3. */
const FONT = {bold: 1, italic: 2, boldItalic: 3} as const;

type Attr = {
    fg?: Hex;
    bg?: Hex;
    font?: keyof typeof FONT;
    effect?: Hex;
    effectType?: keyof typeof EFFECT;
    stripe?: Hex;
};

/** Order of the 16 console ANSI keys, by IntelliJ's names (gray = white, darkgray = bright black). */
const CONSOLE_ANSI: [string, keyof Ansi][] = [
    ["CONSOLE_BLACK_OUTPUT", "black"],
    ["CONSOLE_RED_OUTPUT", "red"],
    ["CONSOLE_GREEN_OUTPUT", "green"],
    ["CONSOLE_YELLOW_OUTPUT", "yellow"],
    ["CONSOLE_BLUE_OUTPUT", "blue"],
    ["CONSOLE_MAGENTA_OUTPUT", "magenta"],
    ["CONSOLE_CYAN_OUTPUT", "cyan"],
    ["CONSOLE_GRAY_OUTPUT", "white"],
    ["CONSOLE_DARKGRAY_OUTPUT", "brightBlack"],
    ["CONSOLE_RED_BRIGHT_OUTPUT", "brightRed"],
    ["CONSOLE_GREEN_BRIGHT_OUTPUT", "brightGreen"],
    ["CONSOLE_YELLOW_BRIGHT_OUTPUT", "brightYellow"],
    ["CONSOLE_BLUE_BRIGHT_OUTPUT", "brightBlue"],
    ["CONSOLE_MAGENTA_BRIGHT_OUTPUT", "brightMagenta"],
    ["CONSOLE_CYAN_BRIGHT_OUTPUT", "brightCyan"],
    ["CONSOLE_WHITE_OUTPUT", "brightWhite"],
];

export const schemeName = (mode: Mode) => `Termicolor ${mode.type === "dark" ? "Dark" : "Light"}`;

/** Editor-wide colors (`<colors>`): caret, gutter, guides, VCS markers, popups. */
function colors({accents: a, roles: r}: Mode): Record<string, Hex | ""> {
    return {
        CARET_COLOR: r.cursor,
        CARET_ROW_COLOR: tint(r.fg, "faint", r.bg),
        SELECTION_BACKGROUND: solid(r.selection, r.bg),
        // keep syntax colors inside the selection
        SELECTION_FOREGROUND: "",
        LINE_NUMBERS_COLOR: r.fgMuted,
        LINE_NUMBER_ON_CARET_ROW_COLOR: r.fg,
        GUTTER_BACKGROUND: r.bg,
        INDENT_GUIDE: r.guide,
        SELECTED_INDENT_GUIDE: r.guideActive,
        VISUAL_INDENT_GUIDE: r.guide,
        RIGHT_MARGIN_COLOR: r.guide,
        WHITESPACES: tint(r.fgMuted, "medium", r.bg),
        SOFT_WRAP_SIGN_COLOR: r.fgMuted,
        TEARLINE_COLOR: r.guide,
        SELECTED_TEARLINE_COLOR: r.guideActive,
        METHOD_SEPARATORS_COLOR: r.border,
        FOLDED_TEXT_BORDER_COLOR: r.border,
        CONSOLE_BACKGROUND_KEY: r.bgSunken,
        DOCUMENTATION_COLOR: r.bgSunken,
        LOOKUP_COLOR: r.bgSunken,
        NOTIFICATION_BACKGROUND: r.bgRaised,
        INFORMATION_HINT: r.bgRaised,
        QUESTION_HINT: r.bgRaised,
        ERROR_HINT: tint(r.danger, "subtle", r.bgSunken),
        ANNOTATIONS_COLOR: r.fgMuted,
        ANNOTATIONS_LAST_COMMIT_COLOR: r.fg,
        ADDED_LINES_COLOR: r.added,
        MODIFIED_LINES_COLOR: r.modified,
        DELETED_LINES_COLOR: r.removed,
        WHITESPACES_MODIFIED_LINES_COLOR: r.fgMuted,
        // project tree / changes view file colors, as VS Code's git decorations
        FILESTATUS_ADDED: r.added,
        FILESTATUS_UNKNOWN: r.added,
        FILESTATUS_MODIFIED: a.yellow,
        FILESTATUS_DELETED: r.removed,
        FILESTATUS_MERGED: r.renamed,
        FILESTATUS_IDEA_FILESTATUS_MERGED_WITH_CONFLICTS: r.conflict,
        FILESTATUS_IDEA_FILESTATUS_IGNORED: r.ignored,
    };
}

/** Text attributes (`<attributes>`): language defaults first, then editor highlights, console, diff. */
function attributes(mode: Mode): Record<string, Attr> {
    const {accents: a, roles: r, syntax: s, ansi} = mode;
    const wave = (color: Hex): Attr => ({effect: color, effectType: "wave", stripe: color});
    const comment: Attr = {fg: s.comment, font: "italic"};
    return {
        TEXT: {fg: r.fg, bg: r.bg},

        // language defaults: every language inherits these unless its scheme overrides them
        DEFAULT_KEYWORD: {fg: s.keyword},
        DEFAULT_IDENTIFIER: {fg: s.variable},
        DEFAULT_STRING: {fg: s.string},
        DEFAULT_VALID_STRING_ESCAPE: {fg: s.escape},
        DEFAULT_INVALID_STRING_ESCAPE: {fg: s.invalid, ...wave(r.danger)},
        DEFAULT_NUMBER: {fg: s.number},
        DEFAULT_CONSTANT: {fg: s.constant},
        DEFAULT_PREDEFINED_SYMBOL: {fg: s.builtin},
        DEFAULT_LINE_COMMENT: comment,
        DEFAULT_BLOCK_COMMENT: comment,
        DEFAULT_DOC_COMMENT: comment,
        DEFAULT_DOC_MARKUP: {fg: s.comment},
        DEFAULT_DOC_COMMENT_TAG: {fg: s.comment, font: "boldItalic"},
        DEFAULT_DOC_COMMENT_TAG_VALUE: {fg: s.parameter, font: "italic"},
        DEFAULT_OPERATION_SIGN: {fg: s.operator},
        DEFAULT_BRACES: {fg: s.punctuation},
        DEFAULT_BRACKETS: {fg: s.punctuation},
        DEFAULT_PARENTHS: {fg: s.punctuation},
        DEFAULT_COMMA: {fg: s.punctuation},
        DEFAULT_SEMICOLON: {fg: s.punctuation},
        DEFAULT_DOT: {fg: s.punctuation},
        DEFAULT_FUNCTION_DECLARATION: {fg: s.function},
        DEFAULT_FUNCTION_CALL: {fg: s.function},
        DEFAULT_INSTANCE_METHOD: {fg: s.function},
        DEFAULT_STATIC_METHOD: {fg: s.function, font: "italic"},
        DEFAULT_CLASS_NAME: {fg: s.type},
        DEFAULT_CLASS_REFERENCE: {fg: s.type},
        DEFAULT_INTERFACE_NAME: {fg: s.type},
        DEFAULT_METADATA: {fg: s.type},
        DEFAULT_PARAMETER: {fg: s.parameter},
        DEFAULT_LOCAL_VARIABLE: {fg: s.variable},
        DEFAULT_REASSIGNED_LOCAL_VARIABLE: {fg: s.variable, effect: r.fgMuted, effectType: "underline"},
        DEFAULT_REASSIGNED_PARAMETER: {fg: s.parameter, effect: r.fgMuted, effectType: "underline"},
        DEFAULT_GLOBAL_VARIABLE: {fg: s.variable},
        DEFAULT_INSTANCE_FIELD: {fg: s.property},
        DEFAULT_STATIC_FIELD: {fg: s.property, font: "italic"},
        DEFAULT_LABEL: {fg: r.fg},
        DEFAULT_TAG: {fg: s.tag},
        DEFAULT_ATTRIBUTE: {fg: s.attribute},
        DEFAULT_ENTITY: {fg: s.escape},
        DEFAULT_TEMPLATE_LANGUAGE_COLOR: {fg: r.fg},
        DEFAULT_INLINE_PARAMETER_HINT: {fg: r.fgMuted, bg: r.bgRaised},
        INLINE_PARAMETER_HINT: {fg: r.fgMuted, bg: r.bgRaised},
        INLINE_PARAMETER_HINT_HIGHLIGHTED: {fg: r.fg, bg: r.bgRaised},
        INLINE_PARAMETER_HINT_CURRENT: {fg: r.fg, bg: tint(r.accent, "subtle", r.bg)},
        INLAY_DEFAULT: {fg: r.fgMuted, bg: r.bgRaised},
        INLAY_TEXT_WITHOUT_BACKGROUND: {fg: r.fgMuted},

        // languages whose bundled schemes set their own colors instead of inheriting the defaults
        HTML_TAG: {fg: s.punctuation},
        HTML_TAG_NAME: {fg: s.tag},
        HTML_ATTRIBUTE_NAME: {fg: s.attribute},
        HTML_ENTITY_REFERENCE: {fg: s.escape},
        XML_TAG: {fg: s.punctuation},
        XML_TAG_NAME: {fg: s.tag},
        XML_ATTRIBUTE_NAME: {fg: s.attribute},
        XML_ENTITY_REFERENCE: {fg: s.escape},
        "JS.REGEXP": {fg: s.regexp},
        MARKDOWN_HEADER_LEVEL_1: {fg: s.heading, font: "bold"},
        MARKDOWN_HEADER_LEVEL_2: {fg: s.heading, font: "bold"},
        MARKDOWN_HEADER_LEVEL_3: {fg: s.heading, font: "bold"},
        MARKDOWN_HEADER_LEVEL_4: {fg: s.heading, font: "bold"},
        MARKDOWN_HEADER_LEVEL_5: {fg: s.heading, font: "bold"},
        MARKDOWN_HEADER_LEVEL_6: {fg: s.heading, font: "bold"},
        MARKDOWN_CODE_SPAN: {fg: a.green},
        MARKDOWN_LINK_TEXT: {fg: s.link},

        // search and usages: other matches orange, word under the caret blue (as VS Code)
        TEXT_SEARCH_RESULT_ATTRIBUTES: {bg: solid(r.findMatch, r.bg), stripe: a.orange},
        SEARCH_RESULT_ATTRIBUTES: {bg: tint(a.blue, "subtle", r.bg), stripe: a.blue},
        WRITE_SEARCH_RESULT_ATTRIBUTES: {bg: tint(a.blue, "soft", r.bg), stripe: a.blue},
        IDENTIFIER_UNDER_CARET_ATTRIBUTES: {bg: tint(a.blue, "subtle", r.bg), stripe: a.blue},
        WRITE_IDENTIFIER_UNDER_CARET_ATTRIBUTES: {bg: tint(a.blue, "soft", r.bg), stripe: a.blue},
        MATCHED_BRACE_ATTRIBUTES: {bg: tint(r.accent, "subtle", r.bg), font: "bold"},
        UNMATCHED_BRACE_ATTRIBUTES: {bg: tint(r.danger, "subtle", r.bg), stripe: r.danger},
        LIVE_TEMPLATE_ATTRIBUTES: {effect: r.accent, effectType: "box"},
        FOLDED_TEXT_ATTRIBUTES: {fg: r.fgSoft, bg: r.bgRaised},
        HYPERLINK_ATTRIBUTES: {fg: s.link, effect: s.link, effectType: "underline"},
        FOLLOWED_HYPERLINK_ATTRIBUTES: {fg: a.purple, effect: a.purple, effectType: "underline"},
        CTRL_CLICKABLE: {fg: s.link, effect: s.link, effectType: "underline"},
        TODO_DEFAULT_ATTRIBUTES: {fg: r.info, font: "boldItalic", stripe: r.info},

        // inspections
        ERRORS_ATTRIBUTES: wave(r.danger),
        WARNING_ATTRIBUTES: wave(r.warning),
        GENERIC_SERVER_ERROR_OR_WARNING: wave(r.warning),
        WEAK_WARNING_ATTRIBUTES: {effect: r.info, effectType: "wave"},
        TYPO: {effect: r.hint, effectType: "wave"},
        WRONG_REFERENCES_ATTRIBUTES: {fg: r.danger},
        BAD_CHARACTER: {fg: r.danger, bg: tint(r.danger, "subtle", r.bg)},
        NOT_USED_ELEMENT_ATTRIBUTES: {fg: r.fgMuted},
        DEPRECATED_ATTRIBUTES: {effect: r.fgSoft, effectType: "strikeout"},
        MARKED_FOR_REMOVAL_ATTRIBUTES: {effect: r.danger, effectType: "strikeout"},

        // debugger
        BREAKPOINT_ATTRIBUTES: {bg: tint(r.danger, "subtle", r.bg), stripe: r.danger},
        EXECUTIONPOINT_ATTRIBUTES: {fg: r.fg, bg: tint(a.blue, "soft", r.bg)},

        // breadcrumbs
        BREADCRUMBS_DEFAULT: {fg: r.fgSoft},
        BREADCRUMBS_HOVERED: {fg: r.fg, bg: solid(r.bgHover, r.bg)},
        BREADCRUMBS_CURRENT: {fg: r.accent},
        BREADCRUMBS_INACTIVE: {fg: r.fgMuted},

        // console
        CONSOLE_NORMAL_OUTPUT: {fg: r.fg},
        CONSOLE_ERROR_OUTPUT: {fg: r.danger},
        CONSOLE_SYSTEM_OUTPUT: {fg: r.fgSoft},
        CONSOLE_USER_INPUT: {fg: r.success, font: "italic"},
        LOG_ERROR_OUTPUT: {fg: r.danger},
        LOG_WARNING_OUTPUT: {fg: r.warning},
        LOG_INFO_OUTPUT: {fg: r.fg},
        LOG_DEBUG_OUTPUT: {fg: r.fgSoft},
        LOG_VERBOSE_OUTPUT: {fg: r.fgMuted},
        LOG_EXPIRED_ENTRY: {fg: r.fgMuted},
        ...Object.fromEntries(CONSOLE_ANSI.map(([key, slot]) => [key, {fg: ansi[slot]}])),

        // diff / merge
        DIFF_INSERTED: {bg: tint(r.added, "subtle", r.bg), stripe: r.added},
        DIFF_MODIFIED: {bg: tint(r.modified, "subtle", r.bg), stripe: r.modified},
        DIFF_DELETED: {bg: tint(r.removed, "subtle", r.bg), stripe: r.removed},
        DIFF_CONFLICT: {bg: tint(r.conflict, "subtle", r.bg), stripe: r.conflict},

        // Rainbow Brackets plugin (five levels per bracket kind)
        ...rainbow(mode),
    };
}

function rainbow({syntax: s}: Mode): Record<string, Attr> {
    const levels = [s.bracket1, s.bracket2, s.bracket3, s.bracket4, s.bracket5];
    return Object.fromEntries(
        ["ROUND", "SQUARE", "SQUIGGLY", "ANGLE"].flatMap((kind) =>
            levels.map((fg, i) => [`${kind}_BRACKET_RAINBOW_COLOR${i}`, {fg}]),
        ),
    );
}

function attrXml(name: string, attr: Attr): string {
    const options: [string, string | number][] = [];
    if (attr.fg) {
        options.push(["FOREGROUND", hex(attr.fg)]);
    }
    if (attr.bg) {
        options.push(["BACKGROUND", hex(attr.bg)]);
    }
    if (attr.font) {
        options.push(["FONT_TYPE", FONT[attr.font]]);
    }
    if (attr.effect) {
        options.push(["EFFECT_COLOR", hex(attr.effect)]);
    }
    if (attr.effectType) {
        options.push(["EFFECT_TYPE", EFFECT[attr.effectType]]);
    }
    if (attr.stripe) {
        options.push(["ERROR_STRIPE_COLOR", hex(attr.stripe)]);
    }
    const values = options.map(([k, v]) => `                <option name="${k}" value="${v}"/>`);
    return [
        `        <option name="${name}">`,
        "            <value>",
        ...values,
        "            </value>",
        "        </option>",
    ].join("\n");
}

/** An IntelliJ editor color scheme (`.icls`), importable on its own or bundled in the theme plugin. */
export function scheme(mode: Mode): string {
    const parent = mode.type === "dark" ? "Darcula" : "Default";
    const colorLines = Object.entries(colors(mode)).map(
        ([k, v]) => `        <option name="${k}" value="${v === "" ? "" : hex(v)}"/>`,
    );
    const attrLines = Object.entries(attributes(mode)).map(([k, v]) => attrXml(k, v));
    return `<?xml version="1.0" encoding="UTF-8"?>
<!-- Termicolor - generated by termicolor, do not edit. https://github.com/repraze/termicolor -->
<scheme name="${schemeName(mode)}" version="142" parent_scheme="${parent}">
    <colors>
${colorLines.join("\n")}
    </colors>
    <attributes>
${attrLines.join("\n")}
    </attributes>
</scheme>
`;
}
