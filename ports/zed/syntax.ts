import type {Mode} from "@repraze/termicolor";

type Highlight = {
    color?: string;
    background_color?: string;
    font_style?: "normal" | "italic" | "oblique";
    font_weight?: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
};

/**
 * Zed's tree-sitter capture names. Zed falls back on the longest matching prefix
 * (`punctuation.bracket` -> `punctuation`), so only captures that differ from their parent are listed.
 * Kept in line with the VS Code token colors: structure is colored, data is plain (DESIGN.md §9).
 */
export function syntax({accents: a, roles: r, syntax: s}: Mode): Record<string, Highlight> {
    return {
        // comments
        comment: {color: s.comment, font_style: "italic"},
        "comment.doc": {color: s.comment, font_style: "italic"},

        // keywords
        keyword: {color: s.keyword},
        preproc: {color: s.keyword},
        "variable.special": {color: s.keyword}, // self, this, super

        // names
        function: {color: s.function},
        type: {color: s.type},
        "type.builtin": {color: s.type},
        namespace: {color: s.type},
        constructor: {color: s.type},
        enum: {color: s.type},
        variant: {color: s.type},
        variable: {color: s.variable},
        "variable.parameter": {color: s.parameter},
        property: {color: s.property},
        attribute: {color: s.attribute},
        label: {color: s.variable},
        primary: {color: r.fg},
        embedded: {color: r.fg},

        // literals
        string: {color: s.string},
        "string.escape": {color: s.escape},
        "string.regex": {color: s.regexp},
        "string.special": {color: s.constant},
        "string.special.symbol": {color: s.constant},
        number: {color: s.number},
        boolean: {color: s.constant},
        constant: {color: s.constant},

        // operators & punctuation
        operator: {color: s.operator},
        punctuation: {color: s.punctuation},
        "punctuation.bracket": {color: s.punctuation},
        "punctuation.delimiter": {color: s.punctuation},
        "punctuation.special": {color: s.keyword}, // ${ } in template strings
        "punctuation.list_marker": {color: s.link},
        "punctuation.markup": {color: s.punctuation},

        // markup
        tag: {color: s.tag},
        selector: {color: a.orange},
        "selector.pseudo": {color: a.orange},
        title: {color: s.heading, font_weight: 700},
        emphasis: {font_style: "italic"},
        "emphasis.strong": {color: s.heading, font_weight: 700},
        "text.literal": {color: s.string},
        link_text: {color: s.link},
        link_uri: {color: s.builtin},

        // editor hints
        hint: {color: r.hint},
        predictive: {color: r.fgMuted, font_style: "italic"},
    };
}
