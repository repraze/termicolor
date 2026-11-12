import type {AccentName, Mode} from "@repraze/termicolor";
import {definePort} from "@termicolor/build";

/** Where the theme and its wallpapers live: the per-user themes folder Windows itself uses. */
const THEMES_DIR = "%LOCALAPPDATA%\\Microsoft\\Windows\\Themes\\Termicolor";

/** 30 minutes, in milliseconds. */
const SLIDESHOW_INTERVAL = 30 * 60 * 1000;

/**
 * The wallpaper shown first, before the slideshow shuffles: a gradient led by the theme's accent.
 * Ids from the wallpapers catalog (port.test.ts checks each lead). Not imported from
 * `@termicolor/wallpapers` so the site doesn't pull every generator into this port's chunk.
 */
export const FEATURED: Record<AccentName, string> = {
    red: "mesh-22",
    orange: "mesh-9",
    yellow: "conic-7",
    green: "conic-10",
    cyan: "linear-1",
    blue: "mesh-1",
    purple: "radial-4",
    pink: "aurora-4",
};

/** The 4K landscape JPG the site's wallpaper gallery downloads by default. */
export const featuredFile = (accent: AccentName, type: Mode["type"]) =>
    `termicolor-${FEATURED[accent]}-${type}-3840x2160.jpg`;

const title = (type: Mode["type"]) => (type === "dark" ? "Dark" : "Light");

/** Windows reads .theme files as INI; keep them CRLF like the ones it ships. */
const crlf = (lines: string[]) => `${lines.join("\r\n")}\r\n`;

/** `0xAARRGGBB`, alpha C4 like the built-in Windows 11 themes. */
const colorization = (hex: string) => `0XC4${hex.slice(1).toUpperCase()}`;

/**
 * Windows 11 theme file, modeled on `%SystemRoot%\Resources\Themes\dark.theme`.
 * https://learn.microsoft.com/windows/win32/controls/themesfileformat-overview
 */
function theme(mode: Mode, accent: AccentName): string {
    const {type, roles: r} = mode;
    const name = title(type);
    const wallpapers = `${THEMES_DIR}\\${name}`;
    return crlf([
        "; Termicolor - generated, do not edit. https://github.com/repraze/termicolor",
        "",
        "[Theme]",
        `DisplayName=Termicolor ${name}`,
        "SetLogonBackground=0",
        "",
        "[Control Panel\\Desktop]",
        `Wallpaper=${wallpapers}\\${featuredFile(accent, type)}`,
        "TileWallpaper=0",
        "; 10: fill, cropped to keep the aspect ratio",
        "WallpaperStyle=10",
        "Pattern=",
        "",
        "[Control Panel\\Desktop\\WindowMetrics]",
        "",
        "[Slideshow]",
        `Interval=${SLIDESHOW_INTERVAL}`,
        "Shuffle=1",
        "; every image directly in this folder, including ones added later",
        `ImagesRootPath=${wallpapers}`,
        "",
        // No [Control Panel\Colors]: Microsoft says not to override them on the Aero style.
        "[VisualStyles]",
        "Path=%SystemRoot%\\resources\\themes\\Aero\\Aero.msstyles",
        "ColorStyle=NormalColor",
        "Size=NormalSize",
        "AutoColorization=0",
        // The vivid fill: Windows paints it as a surface (Start, taskbar, toggles, primary buttons) and
        // derives its own lighter/darker shades for accent text, so it wants the fill, not the text tier.
        `ColorizationColor=${colorization(r.accentFill)}`,
        `SystemMode=${name}`,
        `AppMode=${name}`,
        "VisualStyleVersion=10",
        "",
        "[MasterThemeSelector]",
        "MTSM=RJSPBS",
        "",
        "[Sounds]",
        "; Windows Default",
        "SchemeName=@%SystemRoot%\\System32\\mmres.dll,-800",
        "",
        "[Control Panel\\Cursors]",
        "AppStarting=%SystemRoot%\\cursors\\aero_working.ani",
        "Arrow=%SystemRoot%\\cursors\\aero_arrow.cur",
        "Crosshair=",
        "Hand=%SystemRoot%\\cursors\\aero_link.cur",
        "Help=%SystemRoot%\\cursors\\aero_helpsel.cur",
        "IBeam=",
        "No=%SystemRoot%\\cursors\\aero_unavail.cur",
        "NWPen=%SystemRoot%\\cursors\\aero_pen.cur",
        "SizeAll=%SystemRoot%\\cursors\\aero_move.cur",
        "SizeNESW=%SystemRoot%\\cursors\\aero_nesw.cur",
        "SizeNS=%SystemRoot%\\cursors\\aero_ns.cur",
        "SizeNWSE=%SystemRoot%\\cursors\\aero_nwse.cur",
        "SizeWE=%SystemRoot%\\cursors\\aero_ew.cur",
        "UpArrow=%SystemRoot%\\cursors\\aero_up.cur",
        "Wait=%SystemRoot%\\cursors\\aero_busy.ani",
        "DefaultValue=Windows Default",
        "DefaultValue.MUI=@main.cpl,-1020",
    ]);
}

/**
 * Copies landscape wallpapers downloaded from the site into the slideshow folders, points each theme's
 * first wallpaper at one that exists, installs both themes and applies one.
 */
const INSTALL = String.raw`# Termicolor for Windows - installs the Dark and Light themes and their wallpaper slideshows.
#   powershell -ExecutionPolicy Bypass -File install.ps1 [-Mode Dark|Light] [-Source <folder>]
# -Source holds wallpapers downloaded from the Termicolor site gallery as JPG or PNG
# (termicolor-<id>-<dark|light>-<width>x<height>.jpg). Portrait ones are skipped.
param(
    [ValidateSet("Dark", "Light")] [string] $Mode = "Dark",
    [string] $Source = (Join-Path $HOME "Downloads")
)
$ErrorActionPreference = "Stop"

$root = Join-Path $env:LOCALAPPDATA "Microsoft\Windows\Themes\Termicolor"
$pattern = "^termicolor-.+-(dark|light)-(\d+)x(\d+)\.(jpe?g|png)$"

foreach ($name in "Dark", "Light") {
    $dir = Join-Path $root $name
    New-Item -ItemType Directory -Force -Path $dir | Out-Null
    Get-ChildItem -Path $Source -File | Where-Object {
        $_.Name -match $pattern -and $Matches[1] -eq $name.ToLower() -and [int]$Matches[2] -gt [int]$Matches[3]
    } | Copy-Item -Destination $dir -Force

    $images = @(Get-ChildItem -Path $dir -File | Where-Object { $_.Extension -match "^\.(jpe?g|png)$" })
    $theme = Get-Content -Raw -Path (Join-Path $PSScriptRoot "Termicolor $name.theme")
    $featured = if ($theme -match "(?m)^Wallpaper=.*\\([^\\\r\n]+)\r?$") { $Matches[1] }
    if ($images.Count -eq 0) {
        Write-Warning "No $name wallpapers in $Source - download some from the gallery, then run this again."
    } elseif (-not ($images | Where-Object Name -eq $featured)) {
        # the theme's first wallpaper wasn't downloaded: start on one that was
        $theme = $theme -replace "(?m)^Wallpaper=[^\r\n]*", "Wallpaper=$($images[0].FullName)"
    }
    Set-Content -NoNewline -Path (Join-Path $root "Termicolor $name.theme") -Value $theme
    Write-Host "Termicolor $name - $($images.Count) wallpapers in $dir"
}

# Opening a .theme applies it (and opens Settings > Personalization).
Start-Process (Join-Path $root "Termicolor $Mode.theme")
`;

export default definePort({
    id: "windows-theme",
    name: "Windows theme pack",
    category: "system",
    description:
        "Windows 11 themes: dark or light mode, the accent color on Start, taskbar and controls, and a slideshow of Termicolor wallpapers.",
    homepage: "https://support.microsoft.com/windows/personalize-your-computer",
    tags: ["windows", "windows 11", "theme", "deskthemepack", "accent", "wallpaper", "slideshow", "personalization"],
    install: `
1. **Wallpapers:** Windows can't use SVG, and the repo only commits SVG, so download the landscape wallpapers
   you want from the [wallpaper gallery](https://repraze.github.io/termicolor/ports/wallpapers) as **JPG** (the default), dark ones for the Dark
   theme and light ones for the Light theme. Each theme starts on a 4K gradient led by its accent, then
   shuffles through every image in its folder every 30 minutes.
2. **Install:** put \`install.ps1\` and both \`.theme\` files in one folder and run

   \`\`\`powershell
   powershell -ExecutionPolicy Bypass -File install.ps1 -Mode Dark -Source "$HOME\\Downloads"
   \`\`\`

   It copies \`termicolor-*-dark-*.jpg\` / \`-light-\` landscape files into
   \`%LOCALAPPDATA%\\Microsoft\\Windows\\Themes\\Termicolor\\Dark\\\` and \`...\\Light\\\`, installs both themes next
   to them and applies one. Switch later in *Settings → Personalization → Themes*.

**By hand:** copy the JPG/PNG wallpapers into those \`Dark\\\` and \`Light\\\` folders yourself, then double-click
\`Termicolor Dark.theme\` (or *Settings → Personalization → Themes → Browse*). A missing first wallpaper is fine
once the folder has images: the slideshow takes over.

The accent is fixed (\`AutoColorization=0\`). To also color the taskbar and title bars, turn on *Show accent color
on Start and taskbar* and *on title bars* in *Settings → Personalization → Colors* (Start and taskbar need dark
mode).

A single-file \`.deskthemepack\` is a CAB archive with the wallpapers rendered to JPG inside; that needs a binary
build step (CI) and isn't produced yet.
`,
    build: (palette) => {
        const accent = palette.defaultAccent;
        return [
            {path: "Termicolor Dark.theme", contents: theme(palette.modes.dark, accent)},
            {path: "Termicolor Light.theme", contents: theme(palette.modes.light, accent)},
            {path: "install.ps1", contents: INSTALL.replace(/\n/g, "\r\n")},
        ];
    },
});
