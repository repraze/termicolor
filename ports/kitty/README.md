<!-- Generated from port.ts - do not edit -->
# Termicolor for kitty

Dark and light kitty themes: ANSI colors plus cursor, selection, borders, tab bar and marks.

> **Needs testing.** This port hasn't been checked in kitty yet. If you try it, please
> [report how it looks](https://github.com/repraze/termicolor/issues/new?template=port-test.yml&title=%5Btest%5D+kitty&port=kitty) with a screenshot - see [TESTING.md](../../TESTING.md).

## Install

**Theme kitten:** copy `termicolor-dark.conf` and `termicolor-light.conf` into `~/.config/kitty/themes/`,
then run `kitten themes` and pick *Termicolor Dark* (it's listed under *user-defined*), or apply it directly:

```sh
kitten themes "Termicolor Dark"
```

**Follow the OS light/dark setting:** copy the files into the kitty config folder as
`dark-theme.auto.conf` and `light-theme.auto.conf` (on GNOME also copy the light one as
`no-preference-theme.auto.conf`), then restart kitty.

**Manual:** add `include termicolor-dark.conf` to `~/.config/kitty/kitty.conf`.

## Files

- [`dist/termicolor-dark.conf`](dist/termicolor-dark.conf)
- [`dist/termicolor-light.conf`](dist/termicolor-light.conf)
