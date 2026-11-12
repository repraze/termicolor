<!-- Generated from port.ts - do not edit -->
# Termicolor for Spotify (Spicetify)

Spotify theme

> **Needs testing.** This port hasn't been checked in Spotify (Spicetify) yet. If you try it, please
> [report how it looks](https://github.com/repraze/termicolor/issues/new?template=port-test.yml&title=%5Btest%5D+Spotify+%28Spicetify%29&port=spicetify) with a screenshot - see [TESTING.md](../../TESTING.md).

## Install

Needs [Spicetify](https://spicetify.app/). Copy the `Termicolor` folder into Spicetify's `Themes` folder, so you
end up with `Themes/Termicolor/color.ini` and `user.css`:

| OS            | Path                            |
| ------------- | ------------------------------- |
| Linux / macOS | `~/.config/spicetify/Themes/` |
| Windows       | `%APPDATA%\spicetify\Themes\` |

(`spicetify path userdata` prints the folder that holds `Themes`.) Then pick the theme and a color scheme,
`dark` or `light`, and apply:

```sh
spicetify config current_theme Termicolor color_scheme dark
spicetify apply
```

## Files

- [`dist/Termicolor/color.ini`](dist/Termicolor/color.ini)
- [`dist/Termicolor/user.css`](dist/Termicolor/user.css)
