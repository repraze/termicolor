import {type Mode, solid, tint} from "@repraze/termicolor";

import {schemeName} from "./scheme.ts";

/** Named colors the `ui` keys refer to. All opaque: translucent roles are laid over their surface. */
function named({accents: a, roles: r}: Mode) {
    return {
        bg: r.bg,
        bgSunken: r.bgSunken,
        bgRaised: r.bgRaised,
        hover: solid(r.bgHover, r.bgSunken),
        border: r.border,
        borderStrong: r.borderStrong,
        fg: r.fg,
        fgSoft: r.fgSoft,
        fgMuted: r.fgMuted,
        fgDisabled: r.fgDisabled,
        accent: r.accent,
        accentBright: r.accentBright,
        accentTint: r.accentTint,
        accentFill: r.accentFill,
        onAccentFill: r.onAccentFill,
        accentFaded: tint(r.accent, "soft", r.tabActive),
        focus: solid(r.focusRing, r.bgSunken),
        // focused row in trees and lists: the editor selection strength, so it reads in light mode too
        selected: solid(r.selection, r.bgSunken),
        selection: solid(r.selection, r.bgRaised),
        titlebar: r.titlebar,
        tabActive: r.tabActive,
        tabInactive: r.tabInactive,
        tabIndicator: r.tabIndicator,
        matchActive: r.matchActive,
        onMatchActive: r.onMatchActive,
        danger: r.danger,
        warning: r.warning,
        success: r.success,
        info: r.info,
        link: a.blue,
        linkActive: a.cyan,
        linkVisited: a.purple,
    };
}

type Name = keyof ReturnType<typeof named>;

/** UI keys from IntelliJ's Theme Structure docs, mapped onto the named colors above. */
function ui(): Record<string, Record<string, unknown>> {
    const c = (name: Name) => name;
    return {
        "*": {
            background: c("bgSunken"),
            foreground: c("fg"),
            infoForeground: c("fgSoft"),
            disabledForeground: c("fgDisabled"),
            inactiveForeground: c("fgMuted"),
            selectionBackground: c("selected"),
            selectionForeground: c("fg"),
            selectionInactiveBackground: c("accentTint"),
            selectionBackgroundInactive: c("accentTint"),
            hoverBackground: c("hover"),
            borderColor: c("border"),
            separatorColor: c("border"),
            focusColor: c("focus"),
            focusedBorderColor: c("accent"),
            acceleratorForeground: c("fgSoft"),
        },
        Component: {
            borderColor: c("borderStrong"),
            focusColor: c("focus"),
            focusedBorderColor: c("accent"),
            errorFocusColor: c("danger"),
            inactiveErrorFocusColor: c("danger"),
            warningFocusColor: c("warning"),
            inactiveWarningFocusColor: c("warning"),
            infoForeground: c("fgSoft"),
        },
        Borders: {color: c("border"), ContrastBorderColor: c("border")},
        Separator: {separatorColor: c("border")},
        Panel: {background: c("bgSunken"), foreground: c("fg")},
        Label: {foreground: c("fg"), disabledForeground: c("fgDisabled")},
        Link: {
            activeForeground: c("link"),
            hoverForeground: c("linkActive"),
            pressedForeground: c("linkActive"),
            visitedForeground: c("linkVisited"),
        },

        Tree: {
            background: c("bgSunken"),
            foreground: c("fg"),
            selectionBackground: c("selected"),
            selectionForeground: c("fg"),
            selectionInactiveBackground: c("accentTint"),
            hoverBackground: c("hover"),
        },
        List: {
            background: c("bgSunken"),
            foreground: c("fg"),
            selectionBackground: c("selected"),
            selectionForeground: c("fg"),
            selectionInactiveBackground: c("accentTint"),
            hoverBackground: c("hover"),
        },
        Table: {
            background: c("bgSunken"),
            foreground: c("fg"),
            selectionBackground: c("selected"),
            selectionForeground: c("fg"),
            selectionInactiveBackground: c("accentTint"),
            hoverBackground: c("hover"),
            stripeColor: c("bgRaised"),
            gridColor: c("border"),
        },

        ToolWindow: {
            background: c("bgSunken"),
            Header: {background: c("bgSunken"), inactiveBackground: c("bgSunken"), borderColor: c("border")},
            HeaderTab: {
                selectedInactiveBackground: c("bgRaised"),
                hoverBackground: c("hover"),
                hoverInactiveBackground: c("hover"),
                underlineColor: c("accent"),
                inactiveUnderlineColor: c("borderStrong"),
            },
            Button: {selectedBackground: c("bgRaised"), selectedForeground: c("fg"), hoverBackground: c("hover")},
        },
        EditorTabs: {
            background: c("tabInactive"),
            selectedBackground: c("tabActive"),
            underlinedTabBackground: c("tabActive"),
            underlinedTabForeground: c("fg"),
            hoverBackground: c("bgRaised"),
            inactiveUnderlineColor: c("accentFaded"),
            underlineColor: c("tabIndicator"),
            borderColor: c("border"),
        },
        DefaultTabs: {
            background: c("bgSunken"),
            underlinedTabBackground: c("bgRaised"),
            hoverBackground: c("hover"),
            underlineColor: c("accent"),
            inactiveUnderlineColor: c("borderStrong"),
            borderColor: c("border"),
        },
        TabbedPane: {underlineColor: c("accent"), focusColor: c("bgRaised"), hoverColor: c("hover")},

        TitlePane: {background: c("titlebar"), inactiveBackground: c("titlebar")},
        MainToolbar: {
            background: c("titlebar"),
            inactiveBackground: c("titlebar"),
            foreground: c("fg"),
            Icon: {hoverBackground: c("bgRaised"), pressedBackground: c("borderStrong")},
            Dropdown: {hoverBackground: c("bgRaised"), pressedBackground: c("borderStrong")},
        },
        StatusBar: {
            background: c("bgSunken"),
            borderColor: c("border"),
            Widget: {hoverBackground: c("bgRaised"), pressedBackground: c("borderStrong")},
            Breadcrumb: {
                foreground: c("fgSoft"),
                hoverForeground: c("fg"),
                hoverBackground: c("bgRaised"),
                selectionForeground: c("fg"),
                selectionBackground: c("accentTint"),
            },
        },
        ActionButton: {hoverBackground: c("bgRaised"), pressedBackground: c("borderStrong")},

        Button: {
            startBackground: c("bgRaised"),
            endBackground: c("bgRaised"),
            startBorderColor: c("borderStrong"),
            endBorderColor: c("borderStrong"),
            foreground: c("fg"),
            focusedBorderColor: c("accent"),
            default: {
                startBackground: c("accentFill"),
                endBackground: c("accentFill"),
                startBorderColor: c("accentFill"),
                endBorderColor: c("accentFill"),
                foreground: c("onAccentFill"),
                focusColor: c("focus"),
                focusedBorderColor: c("accentBright"),
            },
        },
        TextField: {background: c("bgRaised"), selectionBackground: c("selection")},
        TextArea: {background: c("bgRaised"), selectionBackground: c("selection")},
        ComboBox: {
            background: c("bgRaised"),
            nonEditableBackground: c("bgRaised"),
            selectionBackground: c("accentTint"),
            selectionForeground: c("fg"),
        },
        CheckBox: {"Background.Selected": c("accentFill"), "Foreground.Selected": c("onAccentFill")},
        Counter: {background: c("accentFill"), foreground: c("onAccentFill")},
        ProgressBar: {
            progressColor: c("accent"),
            indeterminateStartColor: c("accent"),
            indeterminateEndColor: c("accentBright"),
            failedColor: c("danger"),
            passedColor: c("success"),
        },
        SearchMatch: {startBackground: c("matchActive"), endBackground: c("matchActive")},

        Popup: {
            background: c("bgSunken"),
            borderColor: c("borderStrong"),
            inactiveBorderColor: c("border"),
            Header: {activeBackground: c("bgRaised"), inactiveBackground: c("bgSunken")},
            Separator: {foreground: c("border")},
            Toolbar: {background: c("bgSunken"), borderColor: c("border")},
        },
        PopupMenu: {background: c("bgSunken"), selectionBackground: c("accentTint")},
        Menu: {
            background: c("bgSunken"),
            selectionBackground: c("accentTint"),
            selectionForeground: c("fg"),
            borderColor: c("border"),
            separatorColor: c("border"),
        },
        MenuItem: {selectionBackground: c("accentTint"), selectionForeground: c("fg")},
        ToolTip: {background: c("bgRaised"), foreground: c("fg"), borderColor: c("border")},
        Notification: {background: c("bgRaised"), borderColor: c("border")},
    };
}

/** An IntelliJ UI theme (`*.theme.json`). Loaded only from a plugin, which also bundles the editor scheme. */
export function uiTheme(mode: Mode, editorScheme: string) {
    return {
        name: schemeName(mode),
        dark: mode.type === "dark",
        author: "repraze",
        editorScheme,
        colors: named(mode),
        ui: ui(),
    };
}
