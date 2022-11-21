import { HsvColor, RgbColor } from './types';

/**
 * Set the CSS styles for the given element.
 *
 * @param {HTMLElement} element
 * @param {Object} styles
 * @returns {HTMLElement}
 */
export const style = (element: HTMLElement, styles: { [name: string]: string }) => {
    for (const key in styles) {
        if (element.style.getPropertyValue(key) !== styles[key]) {
            element.style.setProperty(key, styles[key]);
        }
    }

    return element;
};

/**
 * Compute the average of a range of absolute values.
 *
 * @param {number[]} values
 * @param {number} start
 * @param {number} end
 */
export const average = (values: number[], start: number, end: number): number => {
    let sum = 0;

    for (let i = Math.min(start, end); i < Math.max(start, end); i++) {
        sum += Math.abs(values[i]);
    }

    return sum / Math.abs(start - end);
};

/**
 * Convert a hex color code to RGB format.
 *
 * @param {string} hex
 * @returns {RgbColor}
 */
export const hex2rgb = (hex: string): RgbColor => {
    const bigint = parseInt(hex.charAt(0) === '#' ? hex.substring(1, 7) : hex, 16);

    return { r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: bigint & 255 };
};

/**
 * Convert a color in RGB format to a color in HSV format.
 *
 * @param {RgbColor} rgb
 * @returns {HsvColor}
 */
export const rgb2hsv = ({ r, g, b }: RgbColor): HsvColor => {
    let h;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;

    if (delta === 0) {
        h = 0;
    } else if (r === max) {
        h = ((g - b) / delta) % 6;
    } else if (g === max) {
        h = (b - r) / delta + 2;
    } else {
        h = (r - g) / delta + 4;
    }

    // hue
    h = Math.round(h * 60);

    if (h < 0) h += 360;

    // saturation
    const s = Math.round((max === 0 ? 0 : delta / max) * 100);

    // value
    const v = Math.round((max / 255) * 100);

    return { h, s, v };
};

/**
 * Convert a color in HSV format to a color in RGB format.
 *
 * @param {HsvColor} hsv
 * @returns {RgbColor}
 */
export const hsv2rgb = ({ h, s, v }: HsvColor): RgbColor => {
    h = h / 60;
    s = s / 100;
    v = (v / 100) * 255;

    const i = Math.floor(h);
    const data = [v * (1 - s), v * (1 - s * (h - i)), v * (1 - s * (1 - (h - i)))];

    switch (i) {
        case 0:
            return { r: v, g: data[2], b: data[0] };
        case 1:
            return { r: data[1], g: v, b: data[0] };
        case 2:
            return { r: data[0], g: v, b: data[2] };
        case 3:
            return { r: data[0], g: data[1], b: v };
        case 4:
            return { r: data[2], g: data[0], b: v };
        default:
            return { r: v, g: data[0], b: data[1] };
    }
};
