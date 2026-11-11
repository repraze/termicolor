import {Carousel, CarouselContent, CarouselDots, CarouselItem} from "@repraze/kernelkit/components/carousel";
import {ACCENTS, allModes} from "@repraze/termicolor";

import {ModePreview} from "@/components/mode-preview";

/** Every slide is the same height, so the hero keeps one size while it plays (and matches KernelKit's). */
const SLIDE = "h-88 overflow-hidden";

/** The hero's right column: the palette in each mode (high contrast included), then the accent tiers. */
export function PaletteShowcase() {
    return (
        <Carousel autoplay={6000} opts={{loop: true}} aria-label="TermiColor showcase">
            <CarouselContent>
                {allModes().map((mode) => (
                    <CarouselItem key={mode.id}>
                        <div className={SLIDE}>
                            <ModePreview mode={mode} className="h-full" />
                        </div>
                    </CarouselItem>
                ))}
                <CarouselItem>
                    <AccentTiers />
                </CarouselItem>
            </CarouselContent>
            <CarouselDots />
        </Carousel>
    );
}

const TIERS = [
    {suffix: "-fill", text: "-on-fill", label: "fill"},
    {suffix: "", text: "-on", label: "text"},
    {suffix: "-tint", text: "", label: "tint"},
    {suffix: "-bright", text: "-on", label: "bright"},
] as const;

/** The eight accents in their four tiers, in the site's current mode. */
function AccentTiers() {
    return (
        <div className={`${SLIDE} bg-card flex flex-col border`}>
            <div className="flex items-center justify-between border-b px-3 py-2">
                <h3 className="font-mono text-xs font-bold tracking-widest uppercase">8 accents · 4 tiers</h3>
                <code className="text-muted-foreground text-[0.65rem]">fill · text · tint · bright</code>
            </div>
            <div className="grid flex-1 grid-cols-4">
                {ACCENTS.map((name) => (
                    <div key={name} className="flex flex-col">
                        {TIERS.map((tier) => (
                            <div
                                key={tier.label}
                                className="flex flex-1 items-end justify-between p-2 font-mono text-[0.65rem]"
                                style={{
                                    background: `var(--tc-${name}${tier.suffix})`,
                                    color: tier.text ? `var(--tc-${name}${tier.text})` : "var(--foreground)",
                                }}
                            >
                                <span>{tier.label === "fill" ? name : tier.label}</span>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}
