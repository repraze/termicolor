<!-- Generated from port.ts - do not edit -->
# Termicolor for Telegram

Telegram Desktop palettes: chat list, bubbles, menus, folders side bar, media viewer and calls.

> **Needs testing.** This port hasn't been checked in Telegram yet. If you try it, please
> [report how it looks](https://github.com/repraze/termicolor/issues/new?template=port-test.yml&title=%5Btest%5D+Telegram&port=telegram) with a screenshot - see [TESTING.md](../../TESTING.md).

## Install

**Load it:** in Telegram Desktop open **Settings → Chat Settings → Chat background → Choose from file** and pick
`termicolor-dark.tdesktop-palette` or `termicolor-light.tdesktop-palette`, then **Apply** in the preview.

Or send the file to your **Saved Messages** and click it there to preview and apply it.

**Chat background:** a palette has no wallpaper, so pick a plain one under **Chat background** afterwards (a dark
solid color for the dark palette) so the bubbles sit on a quiet surface.

**Make a `.tdesktop-theme`** (to share it, or to bundle a wallpaper): rename the palette to
`colors.tdesktop-theme` and zip it, optionally next to a `background.jpg` (or `tiled.jpg` to tile it):

```sh
cp termicolor-dark.tdesktop-palette colors.tdesktop-theme
zip termicolor-dark.tdesktop-theme colors.tdesktop-theme  # add background.jpg here if you have one
```

This covers Telegram Desktop (Windows, macOS, Linux) only; the mobile apps use other theme formats.

## Files

- [`dist/termicolor-dark.tdesktop-palette`](dist/termicolor-dark.tdesktop-palette)
- [`dist/termicolor-light.tdesktop-palette`](dist/termicolor-light.tdesktop-palette)
