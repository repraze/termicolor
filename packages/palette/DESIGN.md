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

## 2. The accent tiers

Eight accents: `red orange yellow green cyan blue purple pink`. Each one comes in tiers. Pick the
tier by **what sits on top of it**.

| Tier        | Name in palette | Use for                                                                             | Guarantee                        |
| ----------- | --------------- | ----------------------------------------------------------------------------------- | -------------------------------- |
| **text**    | `accents`       | colored text, icons, links, syntax, borders, indicators                             | ≥ 4.5:1 on `bg`                  |
| **fill**    | `fills`         | vivid solid surfaces: buttons, badges, swatches, powerline segments, active matches | text on it is `onFill`, ≥ 4.5:1  |
| on accent   | `on`            | text on an `accents` surface, when a slot must reuse the text color as a fill       | ≥ 4.5:1                          |
| **tint**    | `tints`         | opaque wash behind **`fg`** text: soft badges, diff lines, selected list rows       | `fg` on it ≥ 12:1                |
| tint strong | `tintsStrong`   | inline diff words, current line, emphasised rows                                    | `fg` on it ≥ 7:1                 |
| bright      | `brights`       | ANSI 9–14, hover states of accent-colored elements                                  | none (decorative)                |
| dim         | `dims`          | ANSI faint/dim text, de-emphasised accents                                          | ≥ 2:1 (never for essential text) |

Rules:

- **Fills are the brand.** `fills` are the hand-tuned seeds in every mode. Light mode text accents
  are darker (they must read on white); light mode fills are not, which is what keeps light mode
  vivid.
- **Never put accent text on a tint of the same accent.** Text on a tint is `fg`. Color comes from
  the tint, plus an accent border or icon if you need more.
- **One accent per job.** Don't use two accents to mean the same thing in one UI.

## 3. Surfaces and lines

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
contrast. Selected, active or pressed things get a fill, an indicator line or a border (§5).

## 4. Text

| Role         | Use                                                  | Guarantee             |
| ------------ | ---------------------------------------------------- | --------------------- |
| `fg`         | body text, values, the default                       | ≥ 15:1                |
| `fgSoft`     | secondary text, descriptions, comments               | ≥ 7:1                 |
| `fgMuted`    | line numbers, placeholders, metadata (non-essential) | ≥ 3.5:1 (≥ 4.5 in hc) |
| `fgDisabled` | disabled controls only                               | none                  |

Small essential text (< 18px) is never `fgMuted` in normal modes. Use `fgSoft`.

## 5. Interaction and state

| Role                                        | Use                                                                |
| ------------------------------------------- | ------------------------------------------------------------------ |
| `accent` / `onAccent`                       | the one interactive color (purple): primary buttons, focus, cursor |
| `accentTint`                                | highlighted menu item, selected list row (with `fg` text)          |
| `focusRing`                                 | keyboard focus outline (translucent accent)                        |
| `selection` / `selectionInactive`           | text selection, when the target supports alpha                     |
| `selectionSolid` / `selectionInactiveSolid` | the same, flattened over `bg`, for terminals and TUIs              |
| `findMatch` / `findMatchSolid`              | other search matches (a wash)                                      |
| `matchActive` / `onMatchActive`             | the current match: a **solid fill**, never just a stronger wash    |

State checklist for any component:

- **Selected / pressed / current**: `accent` fill with `onAccent` text, **or** an accent indicator
  (border, underline, side bar) next to `fg` text. Never a surface shade alone (see §3).
- **Hover**: `bgHover`, or the `brights` version of an accent-colored element.
- **Focus**: `focusRing` outline, always visible, never removed.
- **Disabled**: `fgDisabled` text. Keep the layout, drop the color.

## 6. Window chrome

| Role                            | Use                                                         |
| ------------------------------- | ----------------------------------------------------------- |
| `titlebar`                      | window title bar                                            |
| `tabActive` / `tabActiveFg`     | active tab: merges into the content below (`bg`, `fg`)      |
| `tabIndicator`                  | accent line on the active tab (top or bottom, app's choice) |
| `tabInactive` / `tabInactiveFg` | other tabs sit on chrome (`bgSunken`, `fgSoft`)             |

Every app themes tabs the same way: the active tab looks like the content it opens.

## 7. Status, VCS and diff

`danger` red · `warning` yellow · `success` green · `info` blue · `hint` cyan.
`added` green · `removed` red · `modified` blue · `renamed` cyan · `conflict` orange · `ignored` muted.

Diff backgrounds are tints: `addedTint` / `removedTint` / `modifiedTint` for lines, and
`addedTintStrong` / `removedTintStrong` for the changed words inside them.

## 8. Syntax

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

## 9. Files

For `ls`, eza, file trees and pickers: `directory` blue · `symlink` cyan · `brokenLink` red ·
`executable` green · `archive` red · `image` purple · `video` pink · `audio` cyan ·
`document` orange · `config` yellow · `source` fg · `temp` muted.

## 10. ANSI

ANSI 1–6 are the text accents (magenta = purple), 9–14 the brights, and the neutrals come from
`ansi`. Terminals that support dim/faint use `dims`. A port maps ANSI from `mode.ansi`, never by
re-picking accents.

## 11. Alpha

Translucent roles (`selection`, `findMatch`, `focusRing`, `bgHover`, `shadow`) are 8-digit hex.
When the target has no alpha, use the `*Solid` role or a tint. Don't flatten in the port.
