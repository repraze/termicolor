<!-- Generated from port.ts - do not edit -->
# Termicolor for Ghostty

Dark and light Ghostty themes: ANSI palette plus cursor, selection, search, splits and titlebar.

## Install

Copy `termicolor-dark` and `termicolor-light` into `~/.config/ghostty/themes/`
(`$XDG_CONFIG_HOME/ghostty/themes/` if set), then in your Ghostty config:

```ini
theme = light:termicolor-light,dark:termicolor-dark
```

Or pin one with `theme = termicolor-dark`. Reload with *Reload Configuration* (`cmd+shift+,` / `ctrl+shift+,`).
The search colors apply to Ghostty's in-terminal search (1.3+); older versions warn about them and ignore them.

## Files

- [`dist/termicolor-dark`](dist/termicolor-dark)
- [`dist/termicolor-light`](dist/termicolor-light)
