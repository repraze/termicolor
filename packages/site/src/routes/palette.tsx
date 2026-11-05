import {useClipboard} from "@mantine/hooks";
import {createFileRoute} from "@tanstack/react-router";
import {ACCENTS, checkMode, contrast, type Hex, type Mode, palette} from "@termicolor/palette";
import {cva} from "class-variance-authority";

import {Badge} from "@/components/ui/badge";

export const Route = createFileRoute("/palette")({
    component: PalettePage,
});

function PalettePage() {
    return (
        <div className="flex flex-col gap-12">
            <section className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold">Palette</h1>
                <p className="text-muted-foreground max-w-2xl text-sm">
                    Dark accents are the hand-tuned seeds. Light accents keep the same hue and are darkened in OKLCH
                    until they reach 4.8:1 on white; each accent gets a paired foreground for solid fills. Click any
                    swatch to copy its hex.
                </p>
            </section>
            {Object.values(palette.modes).map((mode) => (
                <ModeSection key={mode.name} mode={mode} />
            ))}
        </div>
    );
}

/** Each mode renders on its own background regardless of the site theme. */
function ModeSection({mode}: {mode: Mode}) {
    const r = mode.roles;
    const checks = checkMode(mode);
    return (
        <section
            className="flex flex-col gap-4 border p-4"
            style={{background: r.bg, color: r.fg, borderColor: r.border}}
        >
            <h2 className="text-lg font-bold capitalize">{mode.name}</h2>

            <Group title="Accents · bright · on" color={r.fgSoft}>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {ACCENTS.map((name) => (
                        <div key={name} className="flex flex-col">
                            <Swatch hex={mode.accents[name]} label={name} text={mode.on[name]} tall />
                            <Swatch hex={mode.brights[name]} label="bright" text={mode.on[name]} />
                        </div>
                    ))}
                </div>
            </Group>

            <Group title="Roles" color={r.fgSoft}>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {(["bg", "bgSunken", "bgRaised", "border", "borderStrong", "fg", "fgSoft", "fgMuted"] as const).map(
                        (name) => (
                            <Swatch key={name} hex={r[name]} label={name} text={readable(r[name], r)} />
                        ),
                    )}
                </div>
            </Group>

            <Group title="ANSI 16" color={r.fgSoft}>
                <div className="grid grid-cols-8">
                    {Object.entries(mode.ansi).map(([name, hex]) => (
                        <Swatch
                            key={name}
                            hex={hex}
                            label={String(Object.keys(mode.ansi).indexOf(name))}
                            text={readable(hex, r)}
                        />
                    ))}
                </div>
            </Group>

            <Group title="Contrast guarantees (WCAG)" color={r.fgSoft}>
                <div className="grid gap-x-6 text-xs sm:grid-cols-2">
                    {checks.map((c) => (
                        <div key={c.label} className="flex items-center gap-2 py-0.5">
                            <span
                                className="inline-block size-3 border"
                                style={{background: c.fg, borderColor: r.border}}
                            />
                            <span className="flex-1">{c.label}</span>
                            <span style={{color: r.fgSoft}}>≥ {c.min}</span>
                            <Badge variant={c.pass ? "outline" : "destructive"} className="w-14 justify-end">
                                {c.ratio.toFixed(2)}
                            </Badge>
                        </div>
                    ))}
                </div>
            </Group>
        </section>
    );
}

/** Whichever of the mode's fg/bg reads better on `hex`. */
function readable(hex: Hex, r: Mode["roles"]): Hex {
    return contrast(r.fg, hex) >= contrast(r.bg, hex) ? r.fg : r.bg;
}

function Group({title, color, children}: {title: string; color: Hex; children: React.ReactNode}) {
    return (
        <div className="flex flex-col gap-2">
            <h3 className="text-xs tracking-widest uppercase" style={{color}}>
                {title}
            </h3>
            {children}
        </div>
    );
}

const swatchVariants = cva("flex items-end justify-between p-2 text-left text-xs transition-opacity hover:opacity-90", {
    variants: {tall: {true: "h-16", false: "h-8"}},
    defaultVariants: {tall: false},
});

function Swatch({hex, label, text, tall}: {hex: Hex; label: string; text: Hex; tall?: boolean}) {
    const clipboard = useClipboard({timeout: 1000});
    return (
        <button
            type="button"
            className={swatchVariants({tall})}
            style={{background: hex, color: text}}
            onClick={() => clipboard.copy(hex)}
            title={`Copy ${hex}`}
        >
            <span className="font-medium">{label}</span>
            <span>{clipboard.copied ? "copied" : hex}</span>
        </button>
    );
}
