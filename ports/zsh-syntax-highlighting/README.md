<!-- Generated from port.ts - do not edit -->
# Termicolor for zsh-syntax-highlighting

Fish-like command line highlighting for zsh, in the same syntax colors as the editor themes.

## Install

Copy `termicolor-dark.zsh` (or `-light`) to `~/.config/zsh/` and source it in `~/.zshrc`, before the plugin
(which must stay the last thing sourced):

```zsh
source ~/.config/zsh/termicolor-dark.zsh
ZSH_HIGHLIGHT_HIGHLIGHTERS=(main brackets)   # optional: colored bracket levels
source /path/to/zsh-syntax-highlighting/zsh-syntax-highlighting.zsh
```

With a plugin manager, load the theme file before the plugin (oh-my-zsh: source it above `source $ZSH/oh-my-zsh.sh`).

Colors are 24-bit hex, which needs zsh 5.7+ and a truecolor terminal. On a 256-color terminal, add
`zmodload zsh/nearcolor` before sourcing the theme.

## Files

- [`dist/termicolor-dark.zsh`](dist/termicolor-dark.zsh)
- [`dist/termicolor-light.zsh`](dist/termicolor-light.zsh)
