import {ACCENTS} from "@repraze/termicolor";

import {cn} from "@/lib/utils";

/** The eight accents as a flat stripe - the closest thing to a logo for now. */
export function SpectrumBar({className}: {className?: string}) {
    return (
        <div className={cn("flex", className)} aria-hidden>
            {ACCENTS.map((name) => (
                <div key={name} className="flex-1" style={{background: `var(--tc-${name}-fill)`}} />
            ))}
        </div>
    );
}
