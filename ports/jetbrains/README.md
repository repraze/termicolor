<!-- Generated from port.ts - do not edit -->
# Termicolor for JetBrains IDEs

Editor color schemes and UI themes for IntelliJ IDEA, WebStorm, PyCharm and the other JetBrains IDEs.

> **Needs testing.** This port hasn't been checked in JetBrains IDEs yet. If you try it, please
> [report how it looks](https://github.com/repraze/termicolor/issues/new?template=port-test.yml&title=%5Btest%5D+JetBrains+IDEs&port=jetbrains) with a screenshot - see [TESTING.md](../../TESTING.md).

## Install

**Editor color scheme (no plugin needed):** *Settings → Editor → Color Scheme*, click the gear next to
the scheme list, *Import Scheme…*, and pick `termicolor-dark.icls` or `termicolor-light.icls`.
This colors the editor, console, diff and gutter; the rest of the IDE keeps its current theme.

**Full UI theme:** IDE themes only load from a plugin. A theme plugin is just a jar (a zip) holding
`META-INF/plugin.xml` and the theme files, so build it from the `plugin` folder:

```sh
cd ports/jetbrains/dist/plugin
zip -r ../termicolor-jetbrains.jar META-INF themes
```

(Or, with a JDK, `jar cf ../termicolor-jetbrains.jar META-INF themes`.)

Then *Settings → Plugins*, gear, *Install Plugin from Disk…*, pick `termicolor-jetbrains.jar` and
restart. Choose **Termicolor Dark** or **Termicolor Light** in *Settings → Appearance & Behavior →
Appearance → Theme*; each theme switches the editor to its matching scheme.

## Files

- [`dist/termicolor-dark.icls`](dist/termicolor-dark.icls)
- [`dist/termicolor-light.icls`](dist/termicolor-light.icls)
- [`dist/plugin/META-INF/plugin.xml`](dist/plugin/META-INF/plugin.xml)
- [`dist/plugin/themes/termicolor-dark.xml`](dist/plugin/themes/termicolor-dark.xml)
- [`dist/plugin/themes/termicolor-dark.theme.json`](dist/plugin/themes/termicolor-dark.theme.json)
- [`dist/plugin/themes/termicolor-light.xml`](dist/plugin/themes/termicolor-light.xml)
- [`dist/plugin/themes/termicolor-light.theme.json`](dist/plugin/themes/termicolor-light.theme.json)
