<!-- Generated from port.ts - do not edit -->
# Termicolor for btop

Resource monitor themes covering every btop theme key, graphs and meters included.

## Install

Copy the theme files to the user themes folder:

```sh
mkdir -p ~/.config/btop/themes   # or $XDG_CONFIG_HOME/btop/themes
cp termicolor-dark.theme termicolor-light.theme ~/.config/btop/themes/
```

Then select one in `~/.config/btop/btop.conf`:

```ini
color_theme = "termicolor-dark"
theme_background = True
truecolor = True
```

Or pick it live from the options menu (`o`, then *Color theme*). Set `theme_background = False` to keep
your terminal's own background.

## Files

- [`dist/termicolor-dark.theme`](dist/termicolor-dark.theme)
- [`dist/termicolor-light.theme`](dist/termicolor-light.theme)
