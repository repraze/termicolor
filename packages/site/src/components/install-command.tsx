import {
    CodeBlock,
    CodeBlockActions,
    CodeBlockContent,
    CodeBlockCopyButton,
    CodeBlockHeader,
    CodeBlockTitle,
} from "@repraze/kernelkit/components/code-block";

/** `npm install <pkg>` in the kit's code block (title + copy), colored like the kit's bash highlighting. */
export function InstallCommand({pkg, className}: {pkg: string; className?: string}) {
    const command = `npm install ${pkg}`;
    return (
        <CodeBlock className={className}>
            <CodeBlockHeader>
                <CodeBlockTitle>bash</CodeBlockTitle>
                <CodeBlockActions>
                    <CodeBlockCopyButton value={command} />
                </CodeBlockActions>
            </CodeBlockHeader>
            <CodeBlockContent className="text-[13px]">
                <span className="block min-h-lh">
                    <span style={{color: "var(--kk-code-token-function)"}}>npm</span>{" "}
                    <span style={{color: "var(--kk-code-token-string)"}}>install {pkg}</span>
                </span>
            </CodeBlockContent>
        </CodeBlock>
    );
}
