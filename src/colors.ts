// types

/**
 * Formatted hex color value
 */
export type HexValue = string;

/**
 * Formatted rgb color value
 */
export type RgbValue = {
    /**
     * Red, 0-255 integer
     */
    r: number;
    /**
     * Green, 0-255 integer
     */
    g: number;
    /**
     * Blue, 0-255 integer
     */
    b: number;
};

/**
 * Formatted hsl color value
 */
export type HslValue = {
    /**
     * Hue, 0-360 integer
     */
    h: number;
    /**
     * Saturation, 0-100 integer
     */
    s: number;
    /**
     * Lightness, 0-100 integer
     */
    l: number;
};

// color utils

const HEX_REGEX = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i;

export function hexToRgb(value: HexValue): RgbValue {
    const match = HEX_REGEX.exec(value);
    if (match) {
        return {r: parseInt(match[1], 16), g: parseInt(match[2], 16), b: parseInt(match[3], 16)};
    }
    throw new TypeError(`Invalid hex value "${value}"`);
}

export function rgbToHsl({r, g, b}: RgbValue): HslValue {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h;
    let s;
    const l = (max + min) / 2;

    if (max == min) {
        h = s = 0; // achromatic
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r:
                h = (g - b) / d + (g < b ? 6 : 0);
                break;
            case g:
                h = (b - r) / d + 2;
                break;
            case b:
            default:
                h = (r - g) / d + 4;
                break;
        }

        h /= 6;
    }

    return {h: h, s: s, l: l};
}
