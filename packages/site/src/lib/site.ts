import type {AccentName} from "@repraze/termicolor";
import {useEffect} from "react";

/** The site's own accent (brand red). Ports default to `DEFAULT_ACCENT` (purple), DESIGN.md §2. */
export const SITE_ACCENT: AccentName = "red";

/** The brand as the nav and the tab show it. */
export const SITE_NAME = "TermiColor";

/** Sets the tab title: "Page · TermiColor", or the bare name on the home page. */
export function usePageTitle(title?: string) {
    useEffect(() => {
        document.title = title ? `${title} · ${SITE_NAME}` : SITE_NAME;
    }, [title]);
}
