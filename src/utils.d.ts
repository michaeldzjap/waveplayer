import type { HsvColor, RgbColor } from './types/utils';
export declare const throttle: (
	callback: () => void,
	interval?: number,
) => () => void;
export declare const style: (
	element: HTMLElement,
	styles: {
		[name: string]: string;
	},
) => HTMLElement;
export declare const average: (
	values: number[],
	start: number,
	end: number,
) => number;
export declare const hex2rgb: (hex: string) => RgbColor;
export declare const rgb2hsv: ({ r, g, b }: RgbColor) => HsvColor;
export declare const hsv2rgb: ({ h, s, v }: HsvColor) => RgbColor;
export declare const getJson: <T>(url: string) => Promise<T>;
export declare const pick: <T extends object, K extends keyof T>(
	obj: T,
	keys: K[],
) => Pick<T, K>;
