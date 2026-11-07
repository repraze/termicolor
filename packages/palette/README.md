# @repraze/termicolor

The [Termicolor](https://github.com/repraze/termicolor) palette: a high contrast, bright, techy color
system. Light, dark and high-contrast modes, eight accents, and semantic roles, as CSS variables, JSON
and TypeScript.

```bash
npm install @repraze/termicolor
```

## CSS

```css
@import "@repraze/termicolor/palette.css"; /* --tc-* variables, .light/.dark/.hc/.accent-<name> scopes */
@import "@repraze/termicolor/shadcn.css"; /* optional: shadcn/ui tokens (--primary, --border…) on top */
```

```html
<html class="dark accent-cyan"></html>
```

## TypeScript

```ts
import {ACCENTS, createPalette} from "@repraze/termicolor";

const palette = createPalette({accent: "pink"});
palette.modes.dark.roles.bg; // "#171717"
```

Raw values: `@repraze/termicolor/palette.json`.

Design rules (which role to use where): [DESIGN.md](./DESIGN.md).

## License

MIT
