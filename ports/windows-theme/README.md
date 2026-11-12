<!-- Generated from port.ts - do not edit -->
# Termicolor for Windows theme pack

Windows 11 themes: dark or light mode, the accent color on Start, taskbar and controls, and a slideshow of Termicolor wallpapers.

> **Needs testing.** This port hasn't been checked in Windows theme pack yet. If you try it, please
> [report how it looks](https://github.com/repraze/termicolor/issues/new?template=port-test.yml&title=%5Btest%5D+Windows+theme+pack&port=windows-theme) with a screenshot - see [TESTING.md](../../TESTING.md).

## Install

1. **Wallpapers:** Windows can't use SVG, and the repo only commits SVG, so download the landscape wallpapers
   you want from the [wallpaper gallery](https://repraze.github.io/termicolor/ports/wallpapers) as **JPG** (the default), dark ones for the Dark
   theme and light ones for the Light theme. Each theme starts on a 4K gradient led by its accent, then
   shuffles through every image in its folder every 30 minutes.
2. **Install:** put `install.ps1` and both `.theme` files in one folder and run

   ```powershell
   powershell -ExecutionPolicy Bypass -File install.ps1 -Mode Dark -Source "$HOME\Downloads"
   ```

   It copies `termicolor-*-dark-*.jpg` / `-light-` landscape files into
   `%LOCALAPPDATA%\Microsoft\Windows\Themes\Termicolor\Dark\` and `...\Light\`, installs both themes next
   to them and applies one. Switch later in *Settings → Personalization → Themes*.

**By hand:** copy the JPG/PNG wallpapers into those `Dark\` and `Light\` folders yourself, then double-click
`Termicolor Dark.theme` (or *Settings → Personalization → Themes → Browse*). A missing first wallpaper is fine
once the folder has images: the slideshow takes over.

The accent is fixed (`AutoColorization=0`). To also color the taskbar and title bars, turn on *Show accent color
on Start and taskbar* and *on title bars* in *Settings → Personalization → Colors* (Start and taskbar need dark
mode).

A single-file `.deskthemepack` is a CAB archive with the wallpapers rendered to JPG inside; that needs a binary
build step (CI) and isn't produced yet.

## Files

- [`dist/Termicolor Dark.theme`](dist/Termicolor Dark.theme)
- [`dist/Termicolor Light.theme`](dist/Termicolor Light.theme)
- [`dist/install.ps1`](dist/install.ps1)
