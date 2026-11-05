import {Fragment, type ReactNode} from "react";

/**
 * Just enough markdown for port install notes: fenced code, paragraphs, numbered lists,
 * **bold**, `code`, [links](url). Port notes are authored in this repo, so no sanitizing needed.
 */
export function Markdown({source}: {source: string}) {
    const blocks = source.trim().split(/(```[\s\S]*?```)/g);
    return (
        <div className="flex flex-col gap-3 text-sm leading-relaxed">
            {blocks.map((block, i) => {
                if (block.startsWith("```")) {
                    const code = block.replace(/^```\w*\n?/, "").replace(/```$/, "");
                    return (
                        <pre key={i} className="bg-card overflow-x-auto border p-3 text-xs">
                            <code>{code.trimEnd()}</code>
                        </pre>
                    );
                }
                return block
                    .split(/\n{2,}/)
                    .filter((p) => p.trim())
                    .map((para, j) => {
                        const lines = para.trim().split("\n");
                        if (lines.every((l) => /^\d+\.\s/.test(l))) {
                            return (
                                <ol key={`${i}-${j}`} className="list-decimal pl-5">
                                    {lines.map((l, k) => (
                                        <li key={k}>{inline(l.replace(/^\d+\.\s/, ""))}</li>
                                    ))}
                                </ol>
                            );
                        }
                        return <p key={`${i}-${j}`}>{inline(lines.join(" "))}</p>;
                    });
            })}
        </div>
    );
}

function inline(text: string): ReactNode {
    const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g);
    return parts.map((part, i) => {
        if (part.startsWith("**")) {
            return <strong key={i}>{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith("`")) {
            return (
                <code key={i} className="bg-muted px-1 py-0.5 text-xs">
                    {part.slice(1, -1)}
                </code>
            );
        }
        if (part.startsWith("[")) {
            const [, label, href] = /\[([^\]]+)\]\(([^)]+)\)/.exec(part)!;
            return (
                <a key={i} href={href} className="text-primary underline">
                    {label}
                </a>
            );
        }
        if (part.startsWith("*") && part.length > 2) {
            return <em key={i}>{part.slice(1, -1)}</em>;
        }
        return <Fragment key={i}>{part}</Fragment>;
    });
}
