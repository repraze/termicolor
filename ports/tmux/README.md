<!-- Generated from port.ts - do not edit -->
# Termicolor for tmux

Terminal multiplexer: status bar, window list, pane borders, copy mode, messages, popups and menus.

## Install

Copy `termicolor-dark.conf` (or `-light`) to `~/.config/tmux/` and source it from `~/.tmux.conf`
(or `~/.config/tmux/tmux.conf`), after any other style settings. No plugin manager needed:

```tmux
source-file ~/.config/tmux/termicolor-dark.conf
```

Reload with `tmux source-file ~/.tmux.conf`. The status line uses plain text only, no Nerd Font.
The session name turns yellow while the prefix key is held.

Only tmux's own UI is themed: the terminal colors inside panes come from your terminal emulator theme.
The copy mode search styles (`copy-mode-match-style`, `copy-mode-current-match-style`,
`copy-mode-mark-style`) need tmux 3.4+. On older versions delete those lines.

## Files

- [`dist/termicolor-dark.conf`](dist/termicolor-dark.conf)
- [`dist/termicolor-light.conf`](dist/termicolor-light.conf)
