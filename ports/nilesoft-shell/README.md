<!-- Generated from port.ts - do not edit -->
# Termicolor for Nilesoft Shell

Windows context menu theme: menu surface, highlighted item, border, separators and glyphs.

> **Needs testing.** This port hasn't been checked in Nilesoft Shell yet. If you try it, please
> [report how it looks](https://github.com/repraze/termicolor/issues/new?template=port-test.yml&title=%5Btest%5D+Nilesoft+Shell&port=nilesoft-shell) with a screenshot - see [TESTING.md](../../TESTING.md).

## Install

Open the Shell folder: hold **Shift**, right-click the taskbar, then *Shell → directory*.

1. Copy `termicolor.nss` (follows the Windows light/dark setting), or `termicolor-dark.nss` /
   `termicolor-light.nss` for a fixed mode, into the `imports` folder.
2. In `shell.nss`, replace the theme import with yours:

   ```
   import 'imports/termicolor.nss'
   ```

3. Reload: hold **Shift**, right-click the taskbar and choose *Exit Explorer* (Explorer restarts on its own).

## Files

- [`dist/termicolor.nss`](dist/termicolor.nss)
- [`dist/termicolor-dark.nss`](dist/termicolor-dark.nss)
- [`dist/termicolor-light.nss`](dist/termicolor-light.nss)
