<!-- Generated from port.ts - do not edit -->
# Termicolor for PowerShell PSReadLine

Command-line syntax colors for PowerShell (PSReadLine), in dark and light.

> **Needs testing.** This port hasn't been checked in PowerShell PSReadLine yet. If you try it, please
> [report how it looks](https://github.com/repraze/termicolor/issues/new?template=port-test.yml&title=%5Btest%5D+PowerShell+PSReadLine&port=psreadline) with a screenshot - see [TESTING.md](../../TESTING.md).

## Install

1. Save `termicolor-dark.ps1` (or `-light`) somewhere, for example next to your profile.
2. Open your profile (`notepad $PROFILE`, or `code $PROFILE`) and dot-source it:

    ```powershell
    . "$HOME\Documents\PowerShell\termicolor-dark.ps1"
    ```

3. Restart the shell.

Prediction colors are only set where your PSReadLine supports them (2.1+ inline, 2.2+ list view).
Windows PowerShell 5.1 ships PSReadLine 2.0; `Install-Module PSReadLine -Force` gets the current one.
Pair it with a Termicolor terminal scheme (e.g. Windows Terminal) for matching ANSI colors.

## Files

- [`dist/termicolor-dark.ps1`](dist/termicolor-dark.ps1)
- [`dist/termicolor-light.ps1`](dist/termicolor-light.ps1)
