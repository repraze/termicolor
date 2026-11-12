<!-- Generated from port.ts - do not edit -->
# Termicolor for Firefox

Browser theme: frame, tabs, toolbar, address bar, menus, sidebars and new tab page for Firefox.

## Install

**Try it:** open `about:debugging#/runtime/this-firefox` → **Load Temporary Add-on…** → pick
`termicolor-dark/manifest.json` or `termicolor-light/manifest.json`. Temporary add-ons are removed when Firefox
restarts.

**Keep it:** zip the *contents* of a theme folder (`manifest.json` at the zip root) and submit it to
[addons.mozilla.org](https://addons.mozilla.org/developers/) as an unlisted add-on to get it signed, then install the
signed `.xpi`. (Firefox Developer Edition / Nightly can install unsigned zips with `xpinstall.signatures.required`
set to `false`.)

These are plain static themes; the Firefox Color extension isn't needed. Firefox keeps one theme at a time; switch in
`about:addons` → **Themes**.

## Files

- [`dist/termicolor-dark/manifest.json`](dist/termicolor-dark/manifest.json)
- [`dist/termicolor-light/manifest.json`](dist/termicolor-light/manifest.json)
