import {type AccentName, ACCENTS, DEFAULT_ACCENT} from "@repraze/termicolor";

import {oneOf, stored, useStored} from "@/lib/stored";

export {SITE_ACCENT} from "@/lib/site";
export * from "@/lib/theme";

export const PORT_ACCENT_KEY = "termicolor-port-accent";

/** The accent ports are built with on port pages: separate from the site's, defaulting to the ports' own. */
const portAccentStore = stored<AccentName>(PORT_ACCENT_KEY, DEFAULT_ACCENT, oneOf(ACCENTS));

/** Accent picked for port files, shared by every port page and every tab. */
export function usePortAccent() {
    return useStored(portAccentStore);
}
