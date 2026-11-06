import {useQuery} from "@tanstack/react-query";
import {cva} from "class-variance-authority";

import {highlight, type Lang} from "@/lib/highlight";
import {cn} from "@/lib/utils";

const codeVariants = cva("bg-card overflow-auto border text-xs leading-relaxed [&_pre]:p-3 [&_pre]:!bg-transparent", {
    variants: {size: {default: "", tall: "max-h-[32rem]"}},
    defaultVariants: {size: "default"},
});

/** Shiki-highlighted code that recolors with the surrounding theme scope (see lib/highlight.ts). */
export function CodeBlock({
    code,
    lang,
    size,
    className,
}: {
    code: string;
    lang: Lang;
    size?: "default" | "tall";
    className?: string;
}) {
    const {data: html} = useQuery({
        queryKey: ["highlight", lang, code],
        queryFn: () => highlight(code, lang),
        staleTime: Infinity,
    });
    return (
        <div className={cn(codeVariants({size}), className)}>
            {html ? (
                <div dangerouslySetInnerHTML={{__html: html}} />
            ) : (
                <pre>
                    <code>{code}</code>
                </pre>
            )}
        </div>
    );
}
