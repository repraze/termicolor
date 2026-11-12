<!-- Generated from port.ts - do not edit -->
# Termicolor for Ghostty

Dark and light Ghostty themes: ANSI palette plus cursor, selection, search, splits and titlebar.

> **Needs testing.** This port hasn't been checked in Ghostty yet. If you try it, please
> [report how it looks](https://github.com/repraze/termicolor/issues/new?template=port-test.yml&title=%5Btest%5D+Ghostty&port=ghostty) with a screenshot - see [TESTING.md](../../TESTING.md).

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
