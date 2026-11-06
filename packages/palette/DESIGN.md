# Termicolor design principles

Every port and every UI built on Termicolor picks colors by **role**, never by raw hex or by "a color
that looks right". When a target app has a slot this document doesn't cover, add the role here
first, then use it. The build checks every guarantee listed below (`validate.ts`), so a palette
change that breaks one fails CI.

## 1. Modes

| Mode       | Surfaces                             | Use                                     |
| ---------- | ------------------------------------ | --------------------------------------- |
| `dark`     | layered greys (sunken < bg < raised) | default                                 |
| `light`    | white with light grey chrome         | default light                           |
| `dark-hc`  | one black surface, bright borders    | accessibility, projectors, glare, taste |
| `light-hc` | one white surface, dark borders      | same, light                             |

High contrast **keeps every accent and syntax color**. It changes surfaces, lines and secondary text
only, so a theme stays recognisable when you switch to it.

## 2. The accent (overridable)

One accent drives every interactive role: `accent`, `onAccent`, `accentTint`, `accentBright`, `cursor`,
`selection*`, `focusRing`, `tabIndicator` (`ACCENT_ROLES`). It's part of the theme, not the palette:

| Consumer        | Accent | How                                                              |
| --------------- | ------ | ---------------------------------------------------------------- |
| Ports (default) | purple | `DEFAULT_ACCENT`: every generated file, the CSS fallback         |
| Termicolor site | red    | `.accent-red` on `<html>` (brand; `SITE_ACCENT` in the site)     |
| repraze.com     | purple | the default, or `.accent-purple` on `<html>`                     |
| UI library      | pink   | `.accent-pink` on `<html>`, or `createPalette({accent: "pink"})` |

Users of a port get the default and never choose; the site's port pages and `cli.ts --accent`
build any other accent on demand.

- **Generated files** (ports): `createPalette({accent})` builds every role around that accent.
- **CSS**: `palette.css` holds the accent roles for all eight accents (`--tc-accent-<name>-<role>`), and
  `.accent-<name>` on any ancestor points the live roles (`--tc-accent`, `--tc-selection`, ...) at
  them. It works in nested mode scopes too. shadcn's `--primary`, `--ring` and `--accent` follow.
- Every accent must pass the same checks as the default (the build validates all eight), so any
  accent is a safe choice.
- Status colors never follow the accent: `danger` stays red even when the accent is red. Pair
  danger with an icon or a label, not color alone.

## 3. The accent tiers

Eight accents: `red orange yellow green cyan blue purple pink`. Each one comes in tiers. Pick the
tier by **what sits on top of it**.

| Tier      | Name in palette | Use for                                                                             | Guarantee                       |
| --------- | --------------- | ----------------------------------------------------------------------------------- | ------------------------------- |
| **text**  | `accents`       | colored text, icons, links, syntax, borders, indicators                             | ≥ 4.5:1 on `bg`                 |
| **fill**  | `fills`         | vivid solid surfaces: buttons, badges, swatches, powerline segments, active matches | text on it is `onFill`, ≥ 4.5:1 |
| on accent | `on`            | text on an `accents` surface, when a slot must reuse the text color as a fill       | ≥ 4.5:1                         |
| **tint**  | `tints`         | opaque wash behind **`fg`** text: soft badges, diff lines, selected list rows       | `fg` on it ≥ 12:1               |
| bright    | `brights`       | ANSI 9–14, hover states of accent-colored elements                                  | none (decorative)               |

Rules:

- **Fills are the brand.** `fills` are the hand-tuned seeds in every mode. Light mode text accents
  are darker (they must read on white); light mode fills are not, which is what keeps light mode
  vivid.
- **Never put accent text on a tint of the same accent.** Text on a tint is `fg`. Color comes from
  the tint, plus an accent border or icon if you need more.
- **One accent per job.** Don't use two accents to mean the same thing in one UI.

## 4. Surfaces and lines

| Role                    | Use                                                                    |
| ----------------------- | ---------------------------------------------------------------------- |
| `bgSunken`              | chrome around content: page background, sidebars, tab rows, status bar |
| `bg`                    | content: editor, terminal, cards, code blocks                          |
| `bgRaised`              | things that float or take input: inputs, popovers, menus               |
| `bgHover`               | translucent hover wash on any surface                                  |
| `border`                | separators between regions                                             |
| `borderStrong`          | outlines of interactive controls (inputs, outline buttons)             |
| `guide` / `guideActive` | indent guides, rulers                                                  |

In high contrast `bgSunken = bg`: structure comes from `border`, which is bright, not from shading.
So **never signal state with surface shade alone**. `bgRaised` vs `bg` is invisible in high
contrast. Selected, active or pressed things get a fill, an indicator line or a border (§6).

## 5. Text

| Role         | Use                                                  | Guarantee             |
| ------------ | ---------------------------------------------------- | --------------------- |
| `fg`         | body text, values, the default                       | ≥ 15:1                |
| `fgSoft`     | secondary text, descriptions, comments               | ≥ 7:1                 |
| `fgMuted`    | line numbers, placeholders, metadata (non-essential) | ≥ 3.5:1 (≥ 4.5 in hc) |
| `fgDisabled` | disabled controls only                               | none                  |

Small essential text (< 18px) is never `fgMuted` in normal modes. Use `fgSoft`.

## 6. Interaction and state

| Role                              | Use                                                                              |
| --------------------------------- | -------------------------------------------------------------------------------- |
| `accent` / `onAccent`             | the one interactive color (the theme accent, §2): primary buttons, focus, cursor |
| `accentTint`                      | highlighted menu item, selected list row (with `fg` text)                        |
| `focusRing`                       | keyboard focus outline (translucent accent)                                      |
| `selection` / `selectionInactive` | text selection (translucent; `solid(r.selection, r.bg)` without alpha)           |
| `findMatch`                       | other search matches (a medium wash)                                             |
| `matchActive` / `onMatchActive`   | the current match: a **solid fill**, never just a stronger wash                  |

State checklist for any component:

- **Selected / pressed / current**: `accent` fill with `onAccent` text, **or** an accent indicator
  (border, underline, side bar) next to `fg` text. Never a surface shade alone (see §4).
- **Hover**: `bgHover`, or the `brights` version of an accent-colored element.
- **Focus**: `focusRing` outline, always visible, never removed.
- **Disabled**: `fgDisabled` text. Keep the layout, drop the color.

### Clickable surfaces

A card, row or swatch that responds to a click must **look** clickable on hover and keyboard focus,
not just change the cursor:

- **Border or indicator → `accent`.** Cards get an accent border, list rows an accent side bar.
- **Title → `accent`.**
- **Affordance:** an arrow nudges toward the destination, or an icon or label appears (preview, copy).
- No hover wash under accent text: an accent title on a wash drops below 4.5:1 in light modes. The
  border, title and affordance are enough.

In the site this is `clickable` in `packages/site/src/lib/interactive.ts` (a Tailwind `group`).

## 7. Window chrome

| Role                            | Use                                                         |
| ------------------------------- | ----------------------------------------------------------- |
| `titlebar`                      | window title bar                                            |
| `tabActive` / `tabActiveFg`     | active tab: merges into the content below (`bg`, `fg`)      |
| `tabIndicator`                  | accent line on the active tab (top or bottom, app's choice) |
| `tabInactive` / `tabInactiveFg` | other tabs sit on chrome (`bgSunken`, `fgSoft`)             |

Every app themes tabs the same way: the active tab looks like the content it opens.

## 8. Status, VCS and diff

`danger` red · `warning` yellow · `success` green · `info` blue · `hint` cyan.
`added` green · `removed` red · `modified` blue · `renamed` cyan · `conflict` orange · `ignored` muted.

Diff backgrounds are derived, not stored (§13): lines are `tint(a.green|a.red|a.blue, "subtle", r.bg)`
and changed words inside them `"medium"`. Translucent targets use `wash(..., "subtle" | "medium")`.

## 9. Syntax

Principle: **structure is colored, data is plain.** Keywords, functions, types and literals get
accents, while variables, properties and operators stay `fg`, so the code's shape reads at a glance
and the names you read most stay highest contrast.

| Role                                            | Accent                                  | Notes                                                                                                        |
| ----------------------------------------------- | --------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `keyword`, `constant`, `tag`, `heading`         | purple                                  |                                                                                                              |
| `function`, `link`                              | blue                                    |                                                                                                              |
| `type`                                          | yellow                                  |                                                                                                              |
| `string`                                        | green                                   |                                                                                                              |
| `number`, `regexp`, `escape`                    | orange                                  |                                                                                                              |
| `parameter`                                     | pink                                    | function parameters; **shell and PowerShell variables** (`$x`), where data words would vanish among commands |
| `builtin`                                       | cyan                                    | shell builtins, aliases, CLI flags/options, "secondary interactive" words                                    |
| `comment`, `punctuation`                        | fgSoft                                  |                                                                                                              |
| `variable`, `property`, `attribute`, `operator` | fg                                      |                                                                                                              |
| `invalid`                                       | red                                     |                                                                                                              |
| `bracket1`–`bracket6`                           | yellow, purple, cyan, pink, green, blue | bracket-pair colorization, in that order                                                                     |

## 10. Files

For `ls`, eza, file trees and pickers: `directory` blue · `symlink` cyan · `brokenLink` red ·
`executable` green · `archive` red · `image` purple · `video` pink · `audio` cyan ·
`document` orange · `config` yellow · `source` fg · `temp` muted.

## 11. ANSI

ANSI 1–6 are the text accents (magenta = purple), 9–14 the brights, and the neutrals come from
`ansi`. Terminals that support dim/faint (SGR 2) use `ansiDim`: every slot pulled toward `bg` by
one rule (`RULES.dim`), so dim red is still red and dim white is still the lightest neutral. A port maps ANSI from `mode.ansi`, never by
re-picking accents.

## 12. What the palette stores, and what it doesn't

The palette stores **choices**: seeds, the tiers (§3), semantic roles, ANSI (+ dim), syntax and files.
Everything else is a **derivation** of a stored color at a named level (§13), computed where it's
needed. The palette doesn't grow a role for every overlay an app happens to have.

Add a role only when it's a decision (which color means "current match"?), not a strength (how
see-through is a word highlight?). Strength is always a level.

## 13. Derived colors: levels

```ts
import {LEVELS, solid, tint, wash} from "@termicolor/palette";
```

| Level    | Value | Typical use                                     |
| -------- | ----- | ----------------------------------------------- |
| `faint`  | 0.06  | hover washes, barely-there highlights           |
| `subtle` | 0.15  | inactive selection, line highlights, diff lines |
| `soft`   | 0.30  | selection, word highlights                      |
| `medium` | 0.45  | search matches, changed diff words              |
| `strong` | 0.60  | focus rings, emphasis overlays                  |

- `wash(color, level)`: a translucent color, for targets that composite (VS Code, browsers).
- `solid(translucent, over)`: a translucent role laid over a surface, for targets without alpha
  (terminals, TUIs): `solid(r.selection, r.bg)`.
- `tint(color, level, over)`: an opaque blend, e.g. diff lines in delta.

The stored translucent roles (`selection` = soft, `selectionInactive` = subtle, `findMatch` = medium,
`focusRing` = strong, `bgHover` = faint) use the same levels. `ports/roles.test.ts` fails if a port
imports raw color math (`alpha`, `mix`, `flatten`) or passes a number where a level name belongs.

In CSS, use `color-mix(in oklab, var(--tc-red) 15%, transparent)` with the same percentages.
