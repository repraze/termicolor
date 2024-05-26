import {HexValue, HslValue, RgbValue, hexToRgb, rgbToHsl} from "./colors";

export namespace TermiColor {
    export type ColorValue = Readonly<{
        /**
         * Name of the color
         */
        name: string;

        /**
         * Color can be chosen as accent
         */
        accent: boolean;

        hex: HexValue;
        rgb: RgbValue;
        hsl: HslValue;
    }>;

    type TermiColorMode = Readonly<{
        // Accent
        // hex colors for palette naming reference
        red: ColorValue; // #f00
        orange: ColorValue; // #f80
        yellow: ColorValue; // #ff0
        // #8f0
        green: ColorValue; // #0f0
        // #0f8
        cyan: ColorValue; // #0ff
        // #08f
        blue: ColorValue; // #00f
        purple: ColorValue; // #80f
        pink: ColorValue; // #f0f
        // #f08

        // Interface
        foreground: ColorValue;
        backgorund: ColorValue;
    }>;

    export type Modes<T> = {
        light: T;
        // lightHighContrast: T;
        dark: T;
        // darkHighContrast: T;
    };

    function colorValueFromHex(name: string, hex: string, accent = false): ColorValue {
        const rgb = hexToRgb(hex);
        const hsl = rgbToHsl(rgb);
        return {
            name,
            accent,
            hex,
            rgb,
            hsl,
        };
    }

    export const modes: Readonly<Modes<TermiColorMode>> = {
        light: {
            // Accent
            red: colorValueFromHex("red", "#e81c5b", true),
            orange: colorValueFromHex("orange", "#f2671c", true),
            yellow: colorValueFromHex("yellow", "#fab40e", true),
            green: colorValueFromHex("green", "#1db987", true),
            cyan: colorValueFromHex("cyan", "#0ebdc6", true),
            blue: colorValueFromHex("blue", "#2d6ee0", true),
            purple: colorValueFromHex("purple", "#a444ec", true),
            pink: colorValueFromHex("pink", "#e822b8", true),

            // Interface
        },
        dark: {},
    } as const;
}

modes.dark.blue.hsl.h;
