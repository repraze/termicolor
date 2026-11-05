<!-- Generated from port.ts - do not edit -->
# Termicolor for WezTerm

Dark and light WezTerm color schemes (TOML) plus a Lua module that also themes the fancy tab bar and follows the OS appearance.

## Install

**Lua module (recommended):** copy `termicolor.lua` into `~/.config/wezterm/` and add to `wezterm.lua`:

```lua
local termicolor = require("termicolor")
termicolor.apply_to_config(config) -- or termicolor.apply_to_config(config, "light")
```

It registers both schemes, picks one from the OS light/dark setting and colors the fancy tab bar
(`window_frame`). WezTerm reloads the config when the appearance changes.

**Scheme files only:** copy `colors/termicolor-dark.toml` and `colors/termicolor-light.toml` into
`~/.config/wezterm/colors/` (or a `colors` folder next to `wezterm.exe` on Windows) and set:

```lua
config.color_scheme = "Termicolor Dark"
```

## Files

- [`dist/termicolor.lua`](dist/termicolor.lua)
- [`dist/colors/termicolor-dark.toml`](dist/colors/termicolor-dark.toml)
- [`dist/colors/termicolor-light.toml`](dist/colors/termicolor-light.toml)
