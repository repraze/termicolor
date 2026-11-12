<!-- Generated from port.ts - do not edit -->
# Termicolor for Windows Terminal

Color schemes plus a matching window/tab theme for Windows Terminal.

> **Verified** in Windows Terminal on 2026-11-12.

## Install

**Option A - fragment (auto-loads):** copy `termicolor.json` to
`%LOCALAPPDATA%\Microsoft\Windows Terminal\Fragments\termicolor\termicolor.json` and restart.
The schemes appear in *Settings → Color schemes*.

**Option B - settings.json:** paste the objects from `schemes.json` into `"schemes"` and from
`themes.json` into `"themes"`. Then set:

```json
"profiles": {"defaults": {"colorScheme": "Termicolor Dark"}},
"theme": "Termicolor Dark"
```

## Files

- [`dist/termicolor.json`](dist/termicolor.json)
- [`dist/schemes.json`](dist/schemes.json)
- [`dist/themes.json`](dist/themes.json)
