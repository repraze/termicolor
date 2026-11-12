<!-- Generated from port.ts - do not edit -->
# Termicolor for Alacritty

Dark and light Alacritty color files: ANSI colors (normal, bright and dim) plus cursor, vi-mode, selection, search, hints and footer bar.

> **Needs testing.** This port hasn't been checked in Alacritty yet. If you try it, please
> [report how it looks](https://github.com/repraze/termicolor/issues/new?template=port-test.yml&title=%5Btest%5D+Alacritty&port=alacritty) with a screenshot - see [TESTING.md](../../TESTING.md).

## Install

Copy `termicolor-dark.toml` (or `-light`) next to your config, e.g. `~/.config/alacritty/`
(`%APPDATA%\alacritty\` on Windows), and import it from `alacritty.toml`:

```toml
[general]
import = ["~/.config/alacritty/termicolor-dark.toml"]
```

Alacritty reloads the config live.
Needs Alacritty 0.13+ (TOML config).

## Files

- [`dist/termicolor-dark.toml`](dist/termicolor-dark.toml)
- [`dist/termicolor-light.toml`](dist/termicolor-light.toml)
