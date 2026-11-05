<!-- Generated from port.ts - do not edit -->
# Termicolor for bat

TextMate themes for bat, also used by git-delta, plus a delta config with matching diff colors.

## Install

### bat

```sh
mkdir -p "$(bat --config-dir)/themes"
cp termicolor-dark.tmTheme termicolor-light.tmTheme "$(bat --config-dir)/themes/"
bat cache --build
bat --list-themes | grep -i termicolor
```

Then pick the theme in `$(bat --config-file)` (or with `BAT_THEME`):

```sh
--theme="termicolor-dark"
```

bat 0.25+ can follow the terminal's background instead:

```sh
--theme="auto"
--theme-dark="termicolor-dark"
--theme-light="termicolor-light"
```

On Windows, `bat --config-dir` is usually `%APPDATA%\bat`. Run the same copy and `bat cache --build` steps.

### git-delta

[delta](https://github.com/dandavison/delta) reads bat's theme cache, so install the bat themes first
(`delta --list-syntax-themes` should then list them). Copy `delta.gitconfig` somewhere stable
(e.g. `~/.config/delta/termicolor.gitconfig`) and include it from `~/.gitconfig`:

```ini
[include]
    path = ~/.config/delta/termicolor.gitconfig

[core]
    pager = delta

[interactive]
    diffFilter = delta --color-only

[delta]
    features = termicolor-dark
    navigate = true
    # line-numbers = true
    # side-by-side = true

[merge]
    conflictStyle = zdiff3

[diff]
    colorMoved = default
```

Use `features = termicolor-light` on a light terminal. Each feature sets `syntax-theme`, the
added/removed line and word backgrounds, line numbers, hunk headers, blame and merge-conflict styles.

## Files

- [`dist/termicolor-dark.tmTheme`](dist/termicolor-dark.tmTheme)
- [`dist/termicolor-light.tmTheme`](dist/termicolor-light.tmTheme)
- [`dist/delta.gitconfig`](dist/delta.gitconfig)
