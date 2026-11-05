import {definePort, json} from "@termicolor/build";

import {vscodeTheme} from "../vscode/port.ts";

export default definePort({
    id: "shiki",
    name: "Shiki & Monaco",
    category: "web",
    description: "Syntax highlighting themes for shiki (and Monaco via @shikijs/monaco). Same token rules as VS Code.",
    homepage: "https://shiki.style",
    tags: ["syntax", "highlight", "monaco", "textmate", "markdown", "code blocks"],
    install: `
The files are TextMate themes - load them directly:

\`\`\`ts
import termicolorDark from "./termicolor-dark.json";
import termicolorLight from "./termicolor-light.json";

const highlighter = await createHighlighter({themes: [termicolorDark, termicolorLight], langs: ["ts"]});
highlighter.codeToHtml(code, {lang: "ts", themes: {light: "termicolor-light", dark: "termicolor-dark"}});
\`\`\`

For Monaco, register the same themes through \`shikiToMonaco(highlighter, monaco)\`.
`,
    build: (palette) =>
        (["dark", "light"] as const).map((name) => {
            const theme = vscodeTheme(palette.modes[name]);
            return {
                path: `termicolor-${name}.json`,
                contents: json({...theme, name: `termicolor-${name}`, displayName: theme.name}),
            };
        }),
});
