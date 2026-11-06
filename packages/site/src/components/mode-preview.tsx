import {ACCENTS, type Mode} from "@termicolor/palette";

import {CodeBlock} from "@/components/code-block";
import {MODE_LABELS, ModeScope} from "@/components/mode-scope";

const SAMPLE = `// one palette, every app
type Mode = "dark" | "light";

export function accent(mode: Mode, hc = false): string {
    const ratio = hc ? 7.0 : 4.5; // WCAG AA
    return \`contrast >= \${ratio}\`;
}`;

const ansi = (name: string) => ({color: `var(--tc-ansi-${name})`});

/** A mini "editor + terminal" rendered in one palette mode. */
export function ModePreview({mode}: {mode: Mode}) {
    return (
        <ModeScope mode={mode} className="flex flex-col border">
            <div className="flex items-center justify-between border-b px-3 py-2">
                <h3 className="text-xs font-bold tracking-widest uppercase">{MODE_LABELS[mode.id]}</h3>
                <code className="text-muted-foreground text-[0.65rem]">
                    {mode.roles.bg} / {mode.roles.fg}
                </code>
            </div>
            <div className="grid grid-cols-8">
                {ACCENTS.map((name) => (
                    <div
                        key={name}
                        className="flex h-10 items-end p-1 font-mono text-[0.6rem]"
                        style={{background: `var(--tc-${name})`, color: `var(--tc-${name}-on)`}}
                        title={`${name} ${mode.accents[name]}`}
                    >
                        {name.slice(0, 3)}
                    </div>
                ))}
            </div>
            <CodeBlock code={SAMPLE} lang="tsx" className="border-x-0 border-t-0" />
            <pre className="bg-card p-3 font-mono text-xs leading-relaxed">
                <span style={ansi("green")}>repraze</span>
                <span className="text-muted-foreground">@</span>
                <span style={ansi("blue")}>termicolor</span> <span style={ansi("magenta")}>main</span>{" "}
                <span style={ansi("yellow")}>±</span> npm run build{"\n"}
                <span style={ansi("green")}>✓</span> palette: 108 contrast checks{"\n"}
                <span style={ansi("red")}>✗</span> <span className="text-muted-foreground">nothing failed</span>{" "}
                <span style={ansi("cyan")}>in 0.4s</span>
            </pre>
        </ModeScope>
    );
}
