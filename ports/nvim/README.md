<!-- Generated from port.ts - do not edit -->
# Termicolor for Neovim

Lua colorschemes for Neovim 0.9+: editor UI, diagnostics, treesitter, LSP semantic tokens, terminal colors and popular plugins (gitsigns, telescope, nvim-cmp, blink.cmp, which-key, neo-tree, ...).

## Install

The `dist/` folder is a plugin (it has a `colors/` directory). Neovim only (Lua); plain Vim isn't supported.

**lazy.nvim**, from a clone of this repo:

```lua
{
    dir = "~/src/termicolor/ports/nvim/dist",
    name = "termicolor",
    lazy = false,
    priority = 1000,
    config = function()
        vim.cmd.colorscheme("termicolor")
    end,
}
```

**Manual:** copy the `colors/*.lua` files into `~/.config/nvim/colors/`
(Windows: `~/AppData/Local/nvim/colors/`), then:

```lua
vim.cmd.colorscheme("termicolor") -- follows 'background'; or "termicolor-dark" / "termicolor-light"
```

**Rainbow brackets:** rainbow-delimiters.nvim uses the theme's colors as is. For the exact six-color cycle:

```lua
vim.g.rainbow_delimiters = {
    highlight = {
        "TermicolorBracket1", "TermicolorBracket2", "TermicolorBracket3",
        "TermicolorBracket4", "TermicolorBracket5", "TermicolorBracket6",
    },
}
```

## Files

- [`dist/colors/termicolor.lua`](dist/colors/termicolor.lua)
- [`dist/colors/termicolor-dark.lua`](dist/colors/termicolor-dark.lua)
- [`dist/colors/termicolor-light.lua`](dist/colors/termicolor-light.lua)
