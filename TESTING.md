# Testing a port

Termicolor generates its ports from one palette, and nobody owns every app. Most ports have only been checked
against the app's documented format, not looked at in the app itself. Ports someone has checked are marked
**verified**; the rest say **needs testing** on the site and in their README.

If you use one of those apps, a quick test report is the most useful thing you can send.

## 1. Install the port

Follow the port's install steps (on the site or in `ports/<id>/README.md`). Use the default accent unless you
want to test another one.

## 2. Show the sample content

Screenshots should show the theme, not your work. Use the files in [`testing/`](testing/):

| App kind                   | Show                                                                                   |
| -------------------------- | -------------------------------------------------------------------------------------- |
| Editors (VS Code, Neovim…) | [`sample.ts`](testing/sample.ts) open, with the sidebar, a tab bar and the status bar  |
| Terminals, prompts, CLI    | the output of [`colors.sh`](testing/colors.sh) (or [`colors.ps1`](testing/colors.ps1)) |
| Notes / Markdown apps      | [`sample.md`](testing/sample.md) in reading or live preview mode                       |
| Browsers, sites, chat apps | a new tab page or a public page (e.g. this repo on GitHub), with a menu open           |
| System (menus, desktop)    | a right-click menu or the settings page on an empty desktop                            |

If you can, include one shot with a **menu, popup or completion list open** and something **selected or
hovered**: those states are the most likely to be off.

## 3. Keep personal data out

Before taking a screenshot:

- Use a scratch folder, an empty workspace or a fresh profile.
- Hide or crop out names, emails, avatars, hostnames, file paths with your username, tokens and API keys,
  chats, notifications, browser tabs and bookmarks.
- Check every image again before posting. Issues are public and stay public.

## 4. Take the screenshots

- One screenshot **per mode** you tested (dark, light).
- The **app window only**, not the whole desktop.
- **100% display scaling** if you can, around **1280×800** (up to 1920×1080 is fine). Crop rather than shrink.
- **PNG**, under about 2 MB each.

## 5. Send the report

Open a [port test report](https://github.com/repraze/termicolor/issues/new?template=port-test.yml) (each port
page on the site links to it with the port filled in). Say which app version and OS you used and what looked
off: hard-to-read text, invisible hover or selection, colors in the wrong place, install steps that didn't work.

Once a port has a report that looks right, it gets `verified` in its `port.ts` with a link to the report.

## For maintainers

Mark a port verified in `ports/<id>/port.ts`, then run `npm run build:ports`:

```ts
export default definePort({
    verified: {date: "2026-11-12", issue: 42},
    // ...
});
```
