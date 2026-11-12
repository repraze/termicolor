import {type Mode, wash} from "@repraze/termicolor";
import {definePort, json} from "@termicolor/build";

import pkg from "../../package.json" with {type: "json"};

/** Firefox static theme - https://developer.mozilla.org/docs/Mozilla/Add-ons/WebExtensions/manifest.json/theme */
function manifest({type, roles: r}: Mode) {
    const title = type === "dark" ? "Dark" : "Light";
    return {
        manifest_version: 2,
        name: `Termicolor ${title}`,
        version: pkg.version,
        description: "High contrast, bright, techy color theme",
        browser_specific_settings: {gecko: {id: `termicolor-${type}@repraze.com`}},
        theme: {
            colors: {
                // window frame and tab strip
                frame: r.titlebar,
                frame_inactive: r.titlebar,
                tab_selected: r.tabActive,
                tab_text: r.tabActiveFg,
                tab_background_text: r.tabInactiveFg,
                tab_background_separator: r.border,
                tab_line: r.tabIndicator,
                tab_loading: r.accent,
                // toolbar: the selected tab merges into it
                toolbar: r.tabActive,
                toolbar_text: r.fg,
                toolbar_top_separator: r.border,
                toolbar_bottom_separator: r.border,
                toolbar_vertical_separator: r.border,
                bookmark_text: r.fgSoft,
                icons: r.fgSoft,
                icons_attention: r.accent,
                button_background_hover: wash(r.fg, "subtle"),
                button_background_active: wash(r.fg, "soft"),
                // address bar
                toolbar_field: r.bgRaised,
                toolbar_field_text: r.fg,
                toolbar_field_border: r.borderStrong,
                toolbar_field_focus: r.bgRaised,
                toolbar_field_text_focus: r.fg,
                toolbar_field_border_focus: r.accent,
                toolbar_field_highlight: r.selection,
                toolbar_field_highlight_text: r.fg,
                // menus, address bar dropdown
                popup: r.bgRaised,
                popup_text: r.fg,
                popup_border: r.borderStrong,
                popup_highlight: r.accentTint,
                popup_highlight_text: r.fg,
                // sidebars (bookmarks, history)
                sidebar: r.bgSunken,
                sidebar_text: r.fg,
                sidebar_border: r.border,
                sidebar_highlight: r.accentTint,
                sidebar_highlight_text: r.fg,
                // new tab page
                ntp_background: r.bgSunken,
                ntp_text: r.fg,
                ntp_card_background: r.bgRaised,
            },
            properties: {color_scheme: type, content_color_scheme: type},
        },
    };
}

export default definePort({
    id: "firefox",
    name: "Firefox",
    category: "browser",
    description: "Browser theme: frame, tabs, toolbar, address bar, menus, sidebars and new tab page for Firefox.",
    homepage: "https://www.mozilla.org/firefox",
    tags: ["mozilla", "gecko", "librewolf", "browser"],
    install: `
**Try it:** open \`about:debugging#/runtime/this-firefox\` → **Load Temporary Add-on…** → pick
\`termicolor-dark/manifest.json\` or \`termicolor-light/manifest.json\`. Temporary add-ons are removed when Firefox
restarts.

**Keep it:** zip the *contents* of a theme folder (\`manifest.json\` at the zip root) and submit it to
[addons.mozilla.org](https://addons.mozilla.org/developers/) as an unlisted add-on to get it signed, then install the
signed \`.xpi\`. (Firefox Developer Edition / Nightly can install unsigned zips with \`xpinstall.signatures.required\`
set to \`false\`.)

These are plain static themes; the Firefox Color extension isn't needed. Firefox keeps one theme at a time; switch in
\`about:addons\` → **Themes**.
`,
    build: (palette) => [
        {path: "termicolor-dark/manifest.json", contents: json(manifest(palette.modes.dark))},
        {path: "termicolor-light/manifest.json", contents: json(manifest(palette.modes.light))},
    ],
});
