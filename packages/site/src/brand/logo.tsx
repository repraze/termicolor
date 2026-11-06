import {spriteSvg} from "./sprite";

/** Fill the wrapper box instead of the sprite's intrinsic pixel size. */
const fluid = (svg: string) => svg.replace(/width="\d+" height="\d+"/, 'width="100%" height="100%"');

const SVG = fluid(spriteSvg());
const BADGE_SVG = fluid(spriteSvg({badge: true}));

/** The termicolor cyborg head, inlined. Size it with className (e.g. `size-8`); the SVG fills the box. */
export function Logo({className, badge = false}: {className?: string; badge?: boolean}) {
    return (
        <span
            role="img"
            aria-label="termicolor"
            className={className}
            style={{display: "inline-block", lineHeight: 0}}
            // Static markup generated from our own sprite grid, never from user input.
            dangerouslySetInnerHTML={{__html: badge ? BADGE_SVG : SVG}}
        />
    );
}
