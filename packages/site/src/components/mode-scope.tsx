import type {Mode} from "@repraze/termicolor";
import type {ComponentProps} from "react";

import {cn} from "@/lib/utils";

/** Renders children in `mode`'s variable scope, independent of the site theme. */
export function ModeScope({mode, className, ...props}: {mode: Mode} & ComponentProps<"div">) {
    return (
        <div
            data-mode={mode.id}
            className={cn(mode.type, mode.contrast === "high" && "hc", "bg-background text-foreground", className)}
            {...props}
        />
    );
}

export const MODE_LABELS: Record<Mode["id"], string> = {
    dark: "Dark",
    light: "Light",
    "dark-hc": "Dark · high contrast",
    "light-hc": "Light · high contrast",
};
