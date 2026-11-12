<!-- Generated from port.ts - do not edit -->
# Termicolor for Dark Reader

Background, text, selection and scrollbar colors for Dark Reader's dark and light schemes.

> **Needs testing.** This port hasn't been checked in Dark Reader yet. If you try it, please
> [report how it looks](https://github.com/repraze/termicolor/issues/new?template=port-test.yml&title=%5Btest%5D+Dark+Reader&port=dark-reader) with a screenshot - see [TESTING.md](../../TESTING.md).

## Install

**By hand (recommended):** open Dark Reader → **Settings** (or **See all options**) → **Colors** and type in the
values from `colors.md`. Background and text are stored per scheme: enter the dark values while the mode is
**Dark**, then switch to **Light** and enter the light values. These colors apply to the **Dynamic** engine.

**Import:** `termicolor.json` holds both schemes plus selection and scrollbar colors. In **Settings** →
**Advanced** → **Import Settings**, pick the file. Import is not a merge within the theme: it replaces Dark
Reader's whole global theme (brightness, contrast, sepia, grayscale, font and engine go back to defaults, mode to
Dark). Site lists, per-site themes and other settings are left alone. Use **Export Settings** first to keep a
backup.

## Files

- [`dist/termicolor.json`](dist/termicolor.json)
- [`dist/colors.md`](dist/colors.md)
