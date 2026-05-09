import type { RgbColor } from './utils';

interface ViewOptions {
	container: HTMLDivElement | string;
	width: number;
	height: number;
	waveformColor: string;
	progressColor: string;
	barWidth: number;
	barGap: number;
	responsive: boolean;
	gradient: boolean;
	interact: boolean;
	redraw: boolean;
}
interface ViewColors {
	waveformColor: [RgbColor, RgbColor];
	progressColor: [RgbColor, RgbColor];
}
interface View {
	get data(): number[];
	set data(data: number[]);
	get progress(): number;
	set progress(progress: number);
	get container(): HTMLDivElement;
	set container(element: HTMLDivElement | string);
	get width(): number;
	set width(width: number);
	get height(): number;
	set height(height: number);
	get barWidth(): number;
	set barWidth(barWidth: number);
	get barGap(): number;
	set barGap(barGap: number);
	get responsive(): boolean;
	set responsive(responsive: boolean);
	get gradient(): boolean;
	set gradient(gradient: boolean);
	get interact(): boolean;
	set interact(interact: boolean);
	get redraw(): boolean;
	set redraw(redraw: boolean);
	get canvas(): HTMLCanvasElement;
	draw(): this;
	clear(): this;
	destroy(): void;
}

export type { View, ViewColors, ViewOptions };
