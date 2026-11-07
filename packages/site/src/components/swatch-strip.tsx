import {ACCENTS} from "@repraze/termicolor";

/** Accent fills (DESIGN.md §3) with their paired foreground; follows the active mode through CSS vars. */
export function SwatchStrip() {
    return (
        <div className="grid grid-cols-4 border sm:grid-cols-8">
            {ACCENTS.map((name) => (
                <div
                    key={name}
                    className="flex h-16 items-end p-2 text-xs font-medium"
                    style={{background: `var(--tc-${name}-fill)`, color: `var(--tc-${name}-on-fill)`}}
                >
                    {name}
                </div>
            ))}
        </div>
    );
}
