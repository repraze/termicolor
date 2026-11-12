import {type Mode, wash} from "@repraze/termicolor";
import {definePort} from "@termicolor/build";

import pkg from "../../package.json" with {type: "json"};

const title = (mode: Mode) => `Termicolor ${mode.type === "dark" ? "Dark" : "Light"}`;

/**
 * Discord's design tokens. Sets both the pre-2025 names (`--background-primary`, `--text-normal`, ...) and the
 * visual refresh ones (`--background-base-*`, `--background-surface-*`, `--text-default`, `--control-*`, ...).
 * Layout: server rail and title bar sunken, channel list and member list sunken, chat on bg, popouts raised.
 */
function variables({accents: a, fills, onFill, roles: r, syntax: s}: Mode): [string, string][] {
    const hover = r.bgHover;
    const selected = r.accentTint;
    const pressed = wash(r.fg, "soft");
    return [
        // surfaces (refresh)
        ["--app-frame-background", r.titlebar],
        ["--app-frame-border", r.border],
        ["--background-base-lowest", r.bgSunken],
        ["--background-base-lower", r.bgSunken],
        ["--background-base-low", r.bg],
        ["--background-surface-high", r.bgRaised],
        ["--background-surface-higher", r.bgRaised],
        ["--background-surface-highest", r.bgRaised],
        ["--bg-surface-raised", r.bgRaised],
        ["--bg-surface-overlay", r.bgRaised],
        ["--chat-background", r.bg],
        ["--chat-background-default", r.bg],
        ["--chat-border", r.border],
        ["--home-background", r.bg],
        ["--custom-channel-members-bg", r.bgSunken],
        ["--modal-background", r.bgRaised],
        ["--modal-footer-background", r.bgRaised],
        ["--card-background-default", r.bgRaised],
        ["--background-accent", r.borderStrong],
        ["--background-mod-muted", wash(r.fg, "faint")],
        ["--background-mod-subtle", wash(r.fg, "subtle")],
        ["--background-mod-normal", wash(r.fg, "soft")],
        ["--background-mod-strong", wash(r.fg, "medium")],

        // surfaces (legacy)
        ["--background-primary", r.bg],
        ["--background-secondary", r.bgSunken],
        ["--background-secondary-alt", r.bgSunken],
        ["--background-tertiary", r.titlebar],
        ["--background-floating", r.bgRaised],
        ["--background-nested-floating", r.bgRaised],
        ["--background-modifier-hover", hover],
        ["--background-modifier-selected", selected],
        ["--background-modifier-active", pressed],
        ["--background-modifier-accent", r.border],
        ["--deprecated-card-bg", r.bgRaised],

        // hover / selected rows: channels, members, menu items
        ["--interactive-background-hover", hover],
        ["--interactive-background-selected", selected],
        ["--interactive-background-active", pressed],
        ["--message-background-hover", hover],
        ["--background-message-hover", hover],
        ["--user-profile-overlay-background-hover", hover],

        // borders
        ["--border-subtle", r.border],
        ["--border-muted", r.border],
        ["--border-normal", r.border],
        ["--border-strong", r.borderStrong],
        ["--border-focus", r.accent],
        ["--focus-primary", r.accent],

        // text
        ["--text-default", r.fg],
        ["--text-normal", r.fg],
        ["--text-strong", r.fg],
        ["--text-subtle", r.fgSoft],
        ["--text-muted", r.fgMuted],
        ["--header-primary", r.fg],
        ["--header-secondary", r.fgSoft],
        ["--text-link", s.link],
        ["--text-brand", r.accent],
        ["--text-feedback-positive", r.success],
        ["--text-feedback-warning", r.warning],
        ["--text-feedback-critical", r.danger],
        ["--text-feedback-info", r.info],
        ["--text-positive", r.success],
        ["--text-warning", r.warning],
        ["--text-danger", r.danger],
        ["--chat-text-muted", r.fgMuted],
        ["--textbox-markdown-syntax", r.fgMuted],
        ["--channel-text-area-placeholder", r.fgMuted],

        // channels, icons and other interactive text
        ["--channels-default", r.fgSoft],
        ["--channel-icon", r.fgSoft],
        ["--interactive-normal", r.fgSoft],
        ["--interactive-hover", r.fg],
        ["--interactive-active", r.fg],
        ["--interactive-muted", r.fgDisabled],
        ["--interactive-text-default", r.fgSoft],
        ["--interactive-text-hover", r.fg],
        ["--interactive-text-active", r.fg],
        ["--interactive-icon-default", r.fgSoft],
        ["--interactive-icon-hover", r.fg],
        ["--interactive-icon-active", r.fg],
        ["--icon-default", r.fgSoft],
        ["--icon-strong", r.fg],
        ["--icon-subtle", r.fgSoft],
        ["--icon-muted", r.fgMuted],
        ["--icon-link", s.link],
        ["--icon-feedback-positive", r.success],
        ["--icon-feedback-warning", r.warning],
        ["--icon-feedback-critical", r.danger],
        ["--icon-feedback-info", r.info],
        ["--icon-feedback-notification", r.danger],
        ["--icon-voice-muted", r.danger],

        // brand: the accent replaces blurple
        ["--brand-260", r.accent],
        ["--brand-360", r.accent],
        ["--brand-500", r.accentFill],
        ["--brand-530", r.accentBright],
        ["--brand-560", r.accentBright],
        ["--brand-600", r.accentBright],
        ["--brand-experiment", r.accentFill],
        ["--brand-experiment-560", r.accentBright],
        ["--brand-experiment-600", r.accentBright],
        ["--blurple-50", r.accentFill],
        ["--background-brand", r.accentFill],
        ["--control-brand-foreground", r.accent],
        ["--control-brand-foreground-new", r.accent],

        // buttons
        ["--control-primary-background-default", r.accentFill],
        ["--control-primary-background-hover", r.accentBright],
        ["--control-primary-background-active", r.accentBright],
        ["--control-primary-text-default", r.onAccentFill],
        ["--control-primary-text-hover", r.onAccentFill],
        ["--control-primary-text-active", r.onAccentFill],
        ["--control-primary-icon-default", r.onAccentFill],
        ["--control-primary-icon-hover", r.onAccentFill],
        ["--control-primary-icon-active", r.onAccentFill],
        ["--control-secondary-background-default", wash(r.fg, "subtle")],
        ["--control-secondary-background-hover", wash(r.fg, "soft")],
        ["--control-secondary-background-active", wash(r.fg, "medium")],
        ["--control-secondary-border-default", r.border],
        ["--control-secondary-text-default", r.fg],
        ["--control-secondary-text-hover", r.fg],
        ["--control-secondary-text-active", r.fg],
        ["--control-secondary-icon-default", r.fg],
        ["--control-secondary-icon-hover", r.fg],
        ["--control-secondary-icon-active", r.fg],
        ["--control-critical-primary-background-default", fills.red],
        ["--control-critical-primary-background-hover", fills.red],
        ["--control-critical-primary-background-active", fills.red],
        ["--control-critical-primary-text-default", onFill.red],
        ["--control-critical-primary-text-hover", onFill.red],
        ["--control-critical-primary-text-active", onFill.red],
        ["--control-critical-primary-icon-default", onFill.red],
        ["--control-critical-primary-icon-hover", onFill.red],
        ["--control-critical-primary-icon-active", onFill.red],
        ["--control-connected-background-default", fills.green],
        ["--control-connected-background-hover", fills.green],
        ["--control-connected-background-active", fills.green],
        ["--control-connected-border-default", fills.green],

        // inputs and the message box
        ["--input-background", r.bgRaised],
        ["--input-background-default", r.bgRaised],
        ["--input-text-default", r.fg],
        ["--input-placeholder-text-default", r.fgMuted],
        ["--input-border-default", r.borderStrong],
        ["--input-border-hover", r.fgMuted],
        ["--input-border-active", r.accent],
        ["--input-background-error-default", wash(r.danger, "faint")],
        ["--input-border-error-default", r.danger],
        ["--channeltextarea-background", r.bgRaised],

        // checkboxes, radios, switches, sliders
        ["--checkbox-background-default", r.bgRaised],
        ["--checkbox-border-default", r.borderStrong],
        ["--checkbox-background-selected-default", r.accentFill],
        ["--checkbox-background-selected-hover", r.accentBright],
        ["--checkbox-icon-active", r.onAccentFill],
        ["--radio-background-default", r.bgRaised],
        ["--radio-border-default", r.borderStrong],
        ["--radio-background-selected-default", r.accentFill],
        ["--radio-background-selected-hover", r.accentBright],
        ["--radio-thumb-background-active", r.onAccentFill],
        ["--switch-background-default", r.borderStrong],
        ["--switch-background-hover", r.borderStrong],
        ["--switch-background-selected-default", r.accentFill],
        ["--switch-background-selected-hover", r.accentBright],
        ["--slider-track-background", r.borderStrong],
        ["--progressbar-track-background", r.borderStrong],
        ["--progressbar-indicator-background", r.accentFill],

        // mentions: an accent wash on the message, an accent tint behind the @pill with fg text
        ["--mention-background", r.accentTint],
        ["--mention-foreground", r.fg],
        ["--message-mentioned-background-default", wash(r.accent, "subtle")],
        ["--message-mentioned-background-hover", wash(r.accent, "soft")],
        ["--background-mentioned", wash(r.accent, "subtle")],
        ["--background-mentioned-hover", wash(r.accent, "soft")],
        // replied-to / jumped-to message
        ["--message-highlight-background-default", wash(a.blue, "subtle")],
        ["--message-highlight-background-hover", wash(a.blue, "soft")],
        ["--background-message-highlight", wash(a.blue, "subtle")],
        ["--background-message-highlight-hover", wash(a.blue, "soft")],

        // reactions
        ["--message-reacted-background-default", wash(r.accent, "subtle")],
        ["--message-reacted-text-default", r.fg],
        ["--reaction-background-default", wash(r.fg, "faint")],
        ["--reaction-background-hover", wash(r.fg, "subtle")],
        ["--reaction-background-active", wash(r.fg, "subtle")],
        ["--reaction-border-default", r.border],
        ["--reaction-border-hover", r.borderStrong],
        ["--reaction-text-default", r.fgSoft],
        ["--reaction-text-hover", r.fg],
        ["--reaction-background-reacted-default", wash(r.accent, "subtle")],
        ["--reaction-background-reacted-hover", wash(r.accent, "soft")],
        ["--reaction-border-reacted-default", r.accent],
        ["--reaction-text-reacted-default", r.fg],

        // code blocks
        ["--background-code", r.bgSunken],
        ["--background-code-addition", wash(r.added, "subtle")],
        ["--background-code-deletion", wash(r.removed, "subtle")],
        ["--text-code", r.fg],
        ["--text-code-keyword", s.keyword],
        ["--text-code-string", s.string],
        ["--text-code-comment", s.comment],
        ["--text-code-title", s.function],
        ["--text-code-tag", s.tag],
        ["--text-code-variable", s.variable],
        ["--text-code-builtin", s.builtin],
        ["--text-code-section", s.heading],
        ["--text-code-bullet", s.punctuation],
        ["--text-code-addition", r.added],
        ["--text-code-deletion", r.removed],

        // spoilers
        ["--spoiler-hidden-background", r.borderStrong],
        ["--spoiler-hidden-background-hover", r.fgMuted],
        ["--spoiler-revealed-background", wash(r.fg, "subtle")],

        // feedback, notices, badges
        ["--background-feedback-positive", wash(r.success, "subtle")],
        ["--background-feedback-warning", wash(r.warning, "subtle")],
        ["--background-feedback-critical", wash(r.danger, "subtle")],
        ["--background-feedback-info", wash(r.info, "subtle")],
        ["--background-feedback-notification", fills.red],
        ["--badge-notification-background", fills.red],
        ["--badge-background-default", r.accentFill],
        ["--badge-text-default", r.onAccentFill],
        ["--notice-background-positive", fills.green],
        ["--notice-background-warning", fills.yellow],
        ["--notice-background-critical", fills.red],
        ["--notice-background-info", fills.blue],
        ["--notice-text-positive", onFill.green],
        ["--notice-text-warning", onFill.yellow],
        ["--notice-text-critical", onFill.red],
        ["--notice-text-info", onFill.blue],

        // presence
        ["--status-positive", r.success],
        ["--status-positive-background", fills.green],
        ["--status-positive-text", onFill.green],
        ["--status-warning", r.warning],
        ["--status-warning-background", fills.yellow],
        ["--status-warning-text", onFill.yellow],
        ["--status-danger", r.danger],
        ["--status-danger-background", fills.red],
        ["--status-danger-text", onFill.red],
        ["--status-online", a.green],
        ["--status-idle", a.yellow],
        ["--status-dnd", a.red],
        ["--status-offline", r.fgMuted],
        ["--status-speaking", a.green],
        ["--text-status-online", a.green],
        ["--text-status-idle", a.yellow],
        ["--text-status-dnd", a.red],
        ["--text-status-offline", r.fgMuted],
        ["--icon-status-online", a.green],
        ["--icon-status-idle", a.yellow],
        ["--icon-status-dnd", a.red],
        ["--icon-status-offline", r.fgMuted],

        // scrollbars
        ["--scrollbar-thin-thumb", r.borderStrong],
        ["--scrollbar-thin-track", "transparent"],
        ["--scrollbar-auto-thumb", r.borderStrong],
        ["--scrollbar-auto-track", "transparent"],
        ["--scrollbar-auto-scrollbar-color-thumb", r.borderStrong],
        ["--scrollbar-auto-scrollbar-color-track", "transparent"],
    ];
}

/** highlight.js classes in code blocks, in case the client doesn't read the `--text-code-*` tokens. */
function highlights({roles: r, syntax: s}: Mode): [string[], string][] {
    return [
        [[".hljs-keyword", ".hljs-selector-tag", ".hljs-meta .hljs-keyword"], s.keyword],
        [[".hljs-built_in", ".hljs-type"], s.type],
        [[".hljs-title", ".hljs-title.function_"], s.function],
        [[".hljs-string", ".hljs-regexp"], s.string],
        [[".hljs-number", ".hljs-literal"], s.number],
        [[".hljs-comment", ".hljs-quote"], s.comment],
        [[".hljs-attr", ".hljs-attribute"], s.attribute],
        [[".hljs-property"], s.property],
        [[".hljs-variable", ".hljs-template-variable", ".hljs-params"], s.variable],
        [[".hljs-name", ".hljs-tag"], s.tag],
        [[".hljs-selector-class", ".hljs-selector-id"], s.constant],
        [[".hljs-symbol", ".hljs-bullet"], s.escape],
        [[".hljs-meta"], s.builtin],
        [[".hljs-section"], s.heading],
        [[".hljs-link"], s.link],
        [[".hljs-addition"], r.added],
        [[".hljs-deletion"], r.removed],
    ];
}

/** Dark covers Discord's Darker and Midnight variants too; user profile themes keep their own colors. */
const SELECTORS = {
    dark: [".theme-dark", ".theme-darker", ".theme-midnight"],
    light: [".theme-light"],
};

function themeCss(mode: Mode): string {
    const scopes = SELECTORS[mode.type];
    const root = scopes.map((scope) => `${scope}:not(.custom-user-profile-theme)`).join(",\n");
    const decls = variables(mode).map(([name, value]) => `    ${name}: ${value} !important;`);
    const hljs = highlights(mode).map(([classes, color]) => {
        const selector = scopes.flatMap((scope) => classes.map((c) => `${scope} ${c}`));
        return `${selector.join(",\n")} {\n    color: ${color} !important;\n}`;
    });
    const appearance = mode.type === "dark" ? "Dark" : "Light";
    return `/**
 * @name ${title(mode)}
 * @author repraze
 * @version ${pkg.version}
 * @description High contrast, bright, techy colors. Set Discord's appearance to ${appearance}.
 * @source https://github.com/repraze/termicolor
 * @website https://github.com/repraze/termicolor
 */

/* Termicolor for Discord - generated by https://github.com/repraze/termicolor */

${root} {
${decls.join("\n")}
}

${scopes.map((scope) => `${scope} ::selection`).join(",\n")} {
    background-color: ${mode.roles.selection};
}

${hljs.join("\n\n")}
`;
}

export default definePort({
    id: "discord",
    name: "Discord",
    category: "app",
    description: "Vencord / BetterDiscord CSS",
    homepage: "https://discord.com/",
    tags: ["chat", "vencord", "betterdiscord", "css"],
    install: `
Needs a client mod that loads custom CSS. Client mods break Discord's Terms of Service, so use them at your own risk.

- **Vencord / Equicord**: **Settings → Vencord → Themes → Open Themes Folder**, drop
  \`termicolor-dark.theme.css\` and/or \`termicolor-light.theme.css\` in, then enable it in the list. Or paste the
  file's raw GitHub URL under **Online Themes**.
- **BetterDiscord**: **Settings → BetterDiscord → Themes → Open Themes Folder**, drop the file in, and toggle it on.

Each file only styles its own mode: set **User Settings → Appearance** to *Dark* (Darker and Midnight work too) for
\`termicolor-dark\`, or *Light* for \`termicolor-light\`. Enable both to follow whichever you pick.
`,
    build: (palette) =>
        [palette.modes.dark, palette.modes.light].map((mode) => ({
            path: `termicolor-${mode.type}.theme.css`,
            contents: themeCss(mode),
        })),
});
