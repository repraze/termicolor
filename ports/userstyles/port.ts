import {definePort} from "@termicolor/build";

import {github} from "./sites/github.ts";
import {fileName, rawUrl, type Site, userCss} from "./usercss.ts";

/** Every restyled site. Add one by writing `sites/<site>.ts` and listing it here. */
const SITES: Site[] = [github];

export default definePort({
    id: "userstyles",
    name: "Userstyles",
    category: "browser",
    description: "Website restyles (GitHub first)",
    homepage: "https://github.com/openstyles/stylus",
    tags: ["stylus", "github", "usercss"],
    install: `
Install the [Stylus](https://github.com/openstyles/stylus) extension for your browser, then open a style's raw URL.
Stylus spots the \`.user.css\` and offers to install it, and checks the same URL for updates:

${SITES.map((site) => `- **${site.name}**: [\`${fileName(site)}\`](${rawUrl(site)})`).join("\n")}

Or download the file and use **Manage → Import** in Stylus.

**GitHub:** the style follows GitHub's own theme setting (**Settings → Appearance**): any dark theme gets the
Termicolor dark colors, any light theme the light ones, and *Sync with system* switches with your OS. It recolors
GitHub's Primer variables, so pages GitHub hasn't moved to them yet may keep some stock colors.
`,
    build: (palette) => SITES.map((site) => ({path: fileName(site), contents: userCss(site, palette)})),
});
