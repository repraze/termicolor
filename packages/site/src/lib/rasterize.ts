export type RasterFormat = "jpg" | "png";

const MIME: Record<RasterFormat, string> = {jpg: "image/jpeg", png: "image/png"};

/** Sets an SVG's pixel size (its viewBox keeps the drawing), so the browser rasterizes it sharp at that size. */
export function sizeSvg(svg: string, width: number, height: number): string {
    return svg.replace(/<svg\b([^>]*)>/, (_tag, attrs: string) => {
        const rest = attrs.replace(/\s(?:width|height)="[^"]*"/g, "");
        return `<svg${rest} width="${width}" height="${height}">`;
    });
}

/**
 * Renders an SVG wallpaper to JPEG/PNG in the browser, at full size. Desktops (Windows especially)
 * want raster images; doing it here keeps the site from hosting hundreds of MB of pre-rendered files.
 */
export async function rasterize(
    url: string,
    width: number,
    height: number,
    format: RasterFormat,
    quality = 0.92,
): Promise<Blob> {
    const svg = sizeSvg(await (await fetch(url)).text(), width, height);
    const src = URL.createObjectURL(new Blob([svg], {type: "image/svg+xml"}));
    try {
        const img = new Image(width, height);
        img.src = src;
        await img.decode();
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        canvas.getContext("2d")!.drawImage(img, 0, 0, width, height);
        return await new Promise<Blob>((resolve, reject) =>
            canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("toBlob failed"))), MIME[format], quality),
        );
    } finally {
        URL.revokeObjectURL(src);
    }
}

/** Saves a blob through a temporary download link. */
export function saveBlob(blob: Blob, filename: string) {
    const href = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement("a"), {href, download: filename});
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(href), 10_000);
}
