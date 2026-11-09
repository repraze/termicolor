import {markSvg} from "./mark";

const SVG = markSvg();

/**
 * The TermiColor skull, inlined. Size it with className in multiples of 32px so it stays pixel-sharp:
 * `size-8` in the header, `size-16`/`size-24` in a hero (16px for a favicon).
 */
export function Logo({className}: {className?: string}) {
    return (
        <span
            role="img"
            aria-label="TermiColor"
            className={className}
            style={{display: "inline-block", lineHeight: 0}}
            // Static markup generated from our own mark shapes, never from user input.
            dangerouslySetInnerHTML={{__html: SVG}}
        />
    );
}
