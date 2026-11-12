<!-- Generated from port.ts - do not edit -->
# Termicolor for LS_COLORS

Truecolor LS_COLORS for ls, eza, fd, tree and other tools that read it, plus an eza theme.yml for permissions, sizes and git columns.

> **Needs testing.** This port hasn't been checked in LS_COLORS yet. If you try it, please
> [report how it looks](https://github.com/repraze/termicolor/issues/new?template=port-test.yml&title=%5Btest%5D+LS_COLORS&port=dircolors) with a screenshot - see [TESTING.md](../../TESTING.md).

## Install

**dircolors (bash/zsh):** save `termicolor-dark.dircolors` (or `-light`) as `~/.dircolors` and add to your rc file:

```sh
eval "$(dircolors -b ~/.dircolors)"
```

**No dircolors** (macOS without coreutils, fish, or just simpler): source the prebuilt string instead,
`ls-colors-dark.sh` from bash/zsh or `ls-colors-dark.fish` from `config.fish`. GNU `ls` needs
`--color=auto`; BSD/macOS `ls` ignores `LS_COLORS`, but eza, fd, lsd and tree read it.

**eza:** copy `eza-dark.yml` (or `-light`) to `~/.config/eza/theme.yml` (or `$EZA_CONFIG_DIR/theme.yml`).
It colors permissions, sizes, users, dates and git status. `LS_COLORS` / `EZA_COLORS` win where they
overlap, so keep the two in the same mode.

All colors are 24-bit; use a truecolor terminal.

## Files

- [`dist/termicolor-dark.dircolors`](dist/termicolor-dark.dircolors)
- [`dist/ls-colors-dark.sh`](dist/ls-colors-dark.sh)
- [`dist/ls-colors-dark.fish`](dist/ls-colors-dark.fish)
- [`dist/eza-dark.yml`](dist/eza-dark.yml)
- [`dist/termicolor-light.dircolors`](dist/termicolor-light.dircolors)
- [`dist/ls-colors-light.sh`](dist/ls-colors-light.sh)
- [`dist/ls-colors-light.fish`](dist/ls-colors-light.fish)
- [`dist/eza-light.yml`](dist/eza-light.yml)
