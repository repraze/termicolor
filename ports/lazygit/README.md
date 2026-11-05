<!-- Generated from port.ts - do not edit -->
# Termicolor for lazygit

Git TUI theme: borders, selection, cherry-pick and rebase markers.

## Install

Merge one of the files into your lazygit `config.yml`:

| OS      | Path                                              |
| ------- | ------------------------------------------------- |
| Linux   | `~/.config/lazygit/config.yml`                  |
| macOS   | `~/Library/Application Support/lazygit/config.yml` |
| Windows | `%LOCALAPPDATA%\lazygit\config.yml`             |

- `lazygit-dark.yml` / `lazygit-light.yml` set `gui.theme` for one mode.
- `lazygit-auto.yml` sets `gui.darkTheme` and `gui.lightTheme`, and lazygit picks one from the terminal's
  background (`gui.colorScheme: auto`). Needs a lazygit recent enough to have those keys.

To keep the theme in its own file, layer it over your config instead of copying it in:

```sh
export LG_CONFIG_FILE="$HOME/.config/lazygit/config.yml,$HOME/.config/lazygit/lazygit-dark.yml"
```

## Files

- [`dist/lazygit-dark.yml`](dist/lazygit-dark.yml)
- [`dist/lazygit-light.yml`](dist/lazygit-light.yml)
- [`dist/lazygit-auto.yml`](dist/lazygit-auto.yml)
