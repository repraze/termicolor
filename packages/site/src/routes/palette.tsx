import {useClipboard} from "@mantine/hooks";
import {ACCENTS, allModes, checkMode, contrast, type Hex, type Mode} from "@repraze/termicolor";
import {createFileRoute} from "@tanstack/react-router";
import {cva} from "class-variance-authority";
import {CopyIcon} from "lucide-react";

import {MODE_LABELS, ModeScope} from "@/components/mode-scope";
import {Badge} from "@/components/ui/badge";
import {clickable} from "@/lib/interactive";
import {cn} from "@/lib/utils";

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
                    until they reach 4.8:1 on white; each accent gets a paired foreground for solid fills. High contrast
                    variants keep the accents and change only surfaces, borders and secondary text. Click any swatch to
                    copy its hex.
                </p>
            </section>
            {allModes().map((mode) => (
                <ModeSection key={mode.id} mode={mode} />
            ))}
        </div>
    );
}

/** Each mode renders in its own variable scope, so shadcn components inside follow it too. */
function ModeSection({mode}: {mode: Mode}) {
    const r = mode.roles;
    const checks = checkMode(mode);
    return (
        <ModeScope
            id={mode.id}
            mode={mode}
            className="bg-card flex scroll-mt-16 flex-col gap-4 border p-4"
            data-testid={`mode-${mode.id}`}
        >
            <h2 className="text-lg font-bold">{MODE_LABELS[mode.id]}</h2>

            <Group title="Accent tiers · fill · text · tint · bright">
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {ACCENTS.map((name) => (
                        <div key={name} className="flex flex-col">
                            <Swatch hex={mode.fills[name]} label={name} text={mode.onFill[name]} tall />
                            <Swatch hex={mode.accents[name]} label="text" text={mode.on[name]} />
                            <Swatch hex={mode.tints[name]} label="tint" text={r.fg} />
                            <Swatch
                                hex={mode.brights[name]}
                                label="bright"
                                text={readable(mode.brights[name], r, mode.on[name])}
                            />
                        </div>
                    ))}
                </div>
            </Group>

            <Group title="Roles">
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {(["bg", "bgSunken", "bgRaised", "border", "borderStrong", "fg", "fgSoft", "fgMuted"] as const).map(
                        (name) => (
                            <Swatch key={name} hex={r[name]} label={name} text={readable(r[name], r)} />
                        ),
                    )}
                </div>
            </Group>

            <Group title="ANSI 16 · dim">
                <div className="grid grid-cols-8">
                    {Object.entries(mode.ansi).map(([name, hex]) => (
                        <Swatch
                            key={name}
                            hex={hex}
                            label={String(Object.keys(mode.ansi).indexOf(name))}
                            text={readable(hex, r)}
                        />
                    ))}
                    {Object.entries(mode.ansiDim).map(([name, hex]) => (
                        <Swatch
                            key={`dim-${name}`}
                            hex={hex}
                            label="dim"
                            text={readable(hex, r, "#000000", "#ffffff")}
                        />
                    ))}
                </div>
            </Group>

            <Group title="Contrast guarantees (WCAG)">
                <div className="grid gap-x-6 text-xs sm:grid-cols-2">
                    {checks.map((c) => (
                        <div key={c.label} className="flex items-center gap-2 py-0.5">
                            <span className="inline-block size-3 border" style={{background: c.fg}} />
                            <span className="flex-1">{c.label}</span>
                            <span className="text-muted-foreground">≥ {c.min}</span>
                            <Badge variant={c.pass ? "outline" : "destructive"} className="w-14 justify-end">
                                {c.ratio.toFixed(2)}
                            </Badge>
                        </div>
                    ))}
                </div>
            </Group>
        </ModeScope>
    );
}

/** Best-contrast text for a swatch: the mode's fg, bg, or an explicit pairing. */
function readable(hex: Hex, r: Mode["roles"], ...extra: Hex[]): Hex {
    return [r.fg, r.bg, ...extra].reduce((best, c) => (contrast(c, hex) > contrast(best, hex) ? c : best));
}

function Group({title, children}: {title: string; children: React.ReactNode}) {
    return (
        <div className="flex flex-col gap-2">
            <h3 className="text-muted-foreground text-xs tracking-widest uppercase">{title}</h3>
            {children}
        </div>
    );
}

// a copy target: inset outline in the swatch's own text color + a copy icon on hover/focus
const swatchVariants = cva(
    "group/click relative flex items-end justify-between p-2 text-left text-xs outline-none hover:shadow-[inset_0_0_0_2px_currentColor] focus-visible:shadow-[inset_0_0_0_2px_currentColor]",
    {
        variants: {tall: {true: "h-16", false: "h-8"}},
        defaultVariants: {tall: false},
    },
);

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
            <CopyIcon className={cn("absolute top-1.5 right-1.5 size-3", clickable.reveal)} aria-hidden />
            <span className="font-medium">{label}</span>
            <span>{clipboard.copied ? "copied" : hex}</span>
        </button>
    );
}
