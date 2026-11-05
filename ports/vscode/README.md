<!-- Generated from port.ts - do not edit -->
# Termicolor for Visual Studio Code

Dark and light color themes for VS Code and VSCodium, matching repraze.com code blocks.

## Install

Not on the Marketplace yet. Package and install the extension folder:

```sh
cd ports/vscode/dist
npx @vscode/vsce package -o termicolor.vsix
code --install-extension termicolor.vsix
```

Then pick **Termicolor Dark** or **Termicolor Light** in *Preferences: Color Theme*.

## Files

- [`dist/package.json`](dist/package.json)
- [`dist/README.md`](dist/README.md)
- [`dist/LICENSE`](dist/LICENSE)
- [`dist/themes/termicolor-dark.json`](dist/themes/termicolor-dark.json)
- [`dist/themes/termicolor-light.json`](dist/themes/termicolor-light.json)
