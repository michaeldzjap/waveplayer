import type { View as ViewContract, ViewOptions } from './types/View';

declare class View implements ViewContract {
	private static _defaultOptions;
	private _data;
	private _barCoordinates?;
	private _progress;
	private _options;
	private _container;
	private _waveContainer;
	private _canvas;
	private _colors;
	private _resizeHandler?;
	private _clickHandler?;
	constructor(
		data: number[],
		options: Readonly<
			Partial<Omit<ViewOptions, 'container'>> & Pick<ViewOptions, 'container'>
		>,
	);
	get data(): number[];
	set data(data: number[]);
	get progress(): number;
	set progress(progress: number);
	get container(): HTMLDivElement;
	set container(element: HTMLDivElement | string);
	get canvas(): HTMLCanvasElement;
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
	private resolveContainer;
	private createWaveContainer;
	private createCanvas;
	private createColorVariations;
	private addResizeHandler;
	private removeResizeHandler;
	private addClickHandler;
	private removeClickHandler;
	draw(): this;
	clear(): this;
	private computeBarCoordinates;
	private drawBars;
	private drawBar;
	private createProgressIndicatorColorVariation;
	private createGradient;
	private createColor;
	destroy(): void;
}
export default View;
