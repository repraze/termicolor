# Termicolor for Windows - installs the Dark and Light themes and their wallpaper slideshows.
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
