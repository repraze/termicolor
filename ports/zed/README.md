<!-- Generated from port.ts - do not edit -->
# Termicolor for Zed

Dark and light Zed themes in one family: UI, git, terminal ANSI, collaborators and syntax.

> **Needs testing.** This port hasn't been checked in Zed yet. If you try it, please
> [report how it looks](https://github.com/repraze/termicolor/issues/new?template=port-test.yml&title=%5Btest%5D+Zed&port=zed) with a screenshot - see [TESTING.md](../../TESTING.md).

## Install

Copy `themes/termicolor.json` into Zed's themes folder: `~/.config/zed/themes/` on Linux and macOS,
`%APPDATA%\Zed\themes` on Windows. Zed picks it up without a restart.

Pick **Termicolor Dark** or **Termicolor Light** with *theme selector: toggle* (`cmd-k cmd-t` / `ctrl-k ctrl-t`),
or follow the OS light/dark setting in `settings.json`:

```json
{
    "theme": {
        "mode": "system",
        "light": "Termicolor Light",
        "dark": "Termicolor Dark"
    }
}
```

## Files

- [`dist/themes/termicolor.json`](dist/themes/termicolor.json)
