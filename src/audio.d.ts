export declare const interpolate: (
	x: number,
	y: number,
	frac: number,
) => number;
export declare const lin2log: (value: number) => number;
export declare const extractAmplitudes: (
	url: string,
	options?: Readonly<
		Partial<{
			points: number;
			normalise: boolean;
			logarithmic: boolean;
		}>
	>,
) => Promise<number[]>;
