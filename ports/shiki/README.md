<!-- Generated from port.ts - do not edit -->
# Termicolor for Shiki & Monaco

Syntax highlighting themes for shiki (and Monaco via @shikijs/monaco). Same token rules as VS Code.

## Install

The files are TextMate themes - load them directly:

```ts
import termicolorDark from "./termicolor-dark.json";
import termicolorLight from "./termicolor-light.json";

const highlighter = await createHighlighter({themes: [termicolorDark, termicolorLight], langs: ["ts"]});
highlighter.codeToHtml(code, {lang: "ts", themes: {light: "termicolor-light", dark: "termicolor-dark"}});
```

For Monaco, register the same themes through `shikiToMonaco(highlighter, monaco)`.

## Files

- [`dist/termicolor-dark.json`](dist/termicolor-dark.json)
- [`dist/termicolor-light.json`](dist/termicolor-light.json)
