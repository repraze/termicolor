<!-- Generated from port.ts - do not edit -->
# Termicolor for fzf

Fuzzy finder colors as FZF_DEFAULT_OPTS snippets for bash, zsh, fish and PowerShell.

## Install

Copy the files you need to `~/.config/fzf/` (any folder works, adjust the paths below).
Each snippet appends `--color` options to `FZF_DEFAULT_OPTS`, so load it after anything else that sets it.
Use the `-light` files on a light terminal.

**bash / zsh:** add to `~/.bashrc` or `~/.zshrc`:

```sh
source ~/.config/fzf/fzf-dark.sh
```

**fish:** add to `~/.config/fish/config.fish`:

```fish
source ~/.config/fzf/fzf-dark.fish
```

**PowerShell:** add to `$PROFILE`:

```powershell
. "$HOME\.config\fzf\fzf-dark.ps1"
```

**Any shell (fzf 0.48+):** point `FZF_DEFAULT_OPTS_FILE` at `fzf-dark.opts`, which holds the bare options:

```sh
export FZF_DEFAULT_OPTS_FILE=~/.config/fzf/fzf-dark.opts
```

Newer color names (`ghost`, `footer`) need a recent fzf. Older releases reject names they don't know,
so upgrade fzf or delete those entries.

## Files

- [`dist/fzf-dark.opts`](dist/fzf-dark.opts)
- [`dist/fzf-dark.sh`](dist/fzf-dark.sh)
- [`dist/fzf-dark.fish`](dist/fzf-dark.fish)
- [`dist/fzf-dark.ps1`](dist/fzf-dark.ps1)
- [`dist/fzf-light.opts`](dist/fzf-light.opts)
- [`dist/fzf-light.sh`](dist/fzf-light.sh)
- [`dist/fzf-light.fish`](dist/fzf-light.fish)
- [`dist/fzf-light.ps1`](dist/fzf-light.ps1)
