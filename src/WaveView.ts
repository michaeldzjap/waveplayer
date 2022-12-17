/**
 * WaveView.ts
 *
 * © Michaël Dzjaparidze 2022
 * https://github.com/michaeldzjap
 *
 * Draws a waveform using the HTML5 canvas object
 *
 * This work is licensed under the MIT License (MIT)
 */

import { WaveView as WaveViewContract, WaveViewOptions, WaveViewColors } from './types/WaveView';
import { RgbColor } from './types/utils';
import { average, hex2rgb, hsv2rgb, rgb2hsv, style, throttle } from './utils';

/**
 * @class
 * @classdesc Wave view class.
 */
class WaveView implements WaveViewContract {
    /**
     * The default options for a new wave view instance.
     *
     * @var {WaveViewOptions}
     */
    private static _defaultOptions: Readonly<Omit<WaveViewOptions, 'container'>> = {
        width: 512,
        height: 128,
        waveformColor: '#428bca',
        progressColor: '#31708f',
        barWidth: 4,
        barGap: 1,
        responsive: true,
        gradient: true,
        interact: true,
        redraw: true,
    };

    /**
     * The amplitude data that will be used to draw the waveform. Assumed to be
     * in the range [-1.0, 1.0].
     *
     * @var {number[]}
     */
    private _data: number[];

    /**
     * The cached bar coordinates.
     *
     * @var {[number[], number[], number]}
     */
    private _barCoordinates?: [number[], number[], number];

    /**
     * The progress of the waveform, assumed to be in the range [0-1].
     *
     * @var {number}
     */
    private _progress = 0;

    /**
     * The options for this wave view instance.
     *
     * @var {WaveViewOptions}
     */
    private _options: Readonly<WaveViewOptions>;

    /**
     * The HTML div element acting as a container for the wave view.
     *
     * @var {HTMLDivElement}
     */
    private _container: HTMLDivElement;

    /**
     * The HTML div element acting as a container for the canvas element.
     *
     * @var {HTMLDivElement}
     */
    private _waveContainer: HTMLDivElement;

    /**
     * The HTML canvas element.
     *
     * @var {HTMLCanvasElement}
     */
    private _canvas: HTMLCanvasElement;

    /**
     * The colors that will be used for drawing the waveform.
     *
     * @var {WaveViewColors}
     */
    private _colors: WaveViewColors;

    /**
     * The logic that should be executed on a "resize" event.
     *
     * @var {(Function|undefined)}
     */
    private _resizeHandler?: () => void;

    /**
     * The logic that should be executed on a "click" event of the canvas object.
     *
     * @var {(Function|undefined)}
     */
    private _clickHandler?: (e: MouseEvent) => void;

    /**
     * Initialize a new wave view instance.
     *
     * @param {number[]} data
     * @param {WaveViewOptions} options
     */
    constructor(
        data: number[],
        options: Readonly<Partial<Omit<WaveViewOptions, 'container'>> & Pick<WaveViewOptions, 'container'>>,
    ) {
        this._data = data;
        this._options = { ...WaveView._defaultOptions, ...options };
        this._container = this.resolveContainer(this._options.container);
        this._waveContainer = this.createWaveContainer();
        this._canvas = this.createCanvas();
        this._colors = this.createColorVariations();

        if (this._options.responsive) {
            this.addResizeHandler();
        }

        if (this._options.interact) {
            this.addClickHandler();
        }
    }

    /**
     * Get the waveform amplitude data.
     *
     * @returns {number[]}
     */
    public get data(): number[] {
        return this._data;
    }

    /**
     * @inheritdoc
     */
    public set data(data: number[]) {
        this._data = data;

        if (this._options.redraw) this.draw();
    }

    /**
     * @inheritdoc
     */
    public get progress(): number {
        return this._progress;
    }

    /**
     * @inheritdoc
     */
    public set progress(progress: number) {
        this._progress = Math.max(Math.min(progress, 1), 0);

        if (this._options.redraw) {
            this.clear();
            this.drawBars(...this.computeBarCoordinates(true));
        }
    }

    /**
     * @inheritdoc
     */
    public get container(): HTMLDivElement {
        return this._container;
    }

    /**
     * @inheritdoc
     */
    public set container(element: HTMLDivElement | string) {
        this._container = this.resolveContainer(element);
    }

    /**
     * @inheritdoc
     */
    public get width(): number {
        return this._options.width;
    }

    /**
     * @inheritdoc
     */
    public set width(value: number) {
        this._options = { ...this._options, width: value };

        if (this._options.responsive) return;

        style(this._waveContainer, { width: `${this._options.width}px` });
        style(this._canvas, {
            width: `${this._options.width}px`,
        });

        this._canvas.width = this._options.width;

        if (this._options.redraw) this.draw();
    }

    /**
     * @inheritdoc
     */
    public get height(): number {
        return this._options.height;
    }

    /**
     * @inheritdoc
     */
    public set height(value: number) {
        this._options = { ...this._options, height: value };

        style(this._waveContainer, { height: `${this._options.height}px` });
        style(this._canvas, {
            height: `${this._options.height}px`,
        });

        this._canvas.height = this._options.height;

        if (this._options.redraw) this.draw();
    }

    /**
     * @inheritdoc
     */
    public get barWidth(): number {
        return this._options.barWidth;
    }

    /**
     * @inheritdoc
     */
    public set barWidth(value: number) {
        this._options = { ...this._options, barWidth: value };

        if (this._options.redraw) this.draw();
    }

    /**
     * @inheritdoc
     */
    public get barGap(): number {
        return this._options.barGap;
    }

    /**
     * @inheritdoc
     */
    public set barGap(value: number) {
        this._options = { ...this._options, barGap: value };

        if (this._options.redraw) this.draw();
    }

    /**
     * @inheritdoc
     */
    public get responsive(): boolean {
        return this._options.responsive;
    }

    /**
     * @inheritdoc
     */
    public set responsive(value: boolean) {
        this._options = { ...this._options, responsive: value };

        value ? this.addResizeHandler() : this.removeResizeHandler();
    }

    /**
     * @inheritdoc
     */
    public get gradient(): boolean {
        return this._options.gradient;
    }

    /**
     * @inheritdoc
     */
    public set gradient(value: boolean) {
        this._options = { ...this._options, gradient: value };

        if (this._options.redraw) {
            this.clear();
            this.drawBars(...this.computeBarCoordinates(true));
        }
    }

    /**
     * @inheritdoc
     */
    public get interact(): boolean {
        return this._options.interact;
    }

    /**
     * @inheritdoc
     */
    public set interact(value: boolean) {
        this._options = { ...this._options, interact: value };

        value ? this.addClickHandler() : this.removeClickHandler();
    }

    /**
     * @inheritdoc
     */
    public get redraw(): boolean {
        return this._options.redraw;
    }

    /**
     * @inheritdoc
     */
    public set redraw(value: boolean) {
        this._options = { ...this._options, redraw: value };
    }

    /**
     * @inheritdoc
     */
    public get onClick(): ((e: MouseEvent) => void) | undefined {
        return this._options.onClick;
    }

    /**
     * @inheritdoc
     */
    public set onClick(callback: ((e: MouseEvent) => void) | undefined) {
        this._options = { ...this._options, onClick: callback };
    }

    /**
     * Resolve an existing container HTML element.
     *
     * @returns {(HTMLDivElement|string)}
     */
    private resolveContainer(container: HTMLDivElement | string): HTMLDivElement {
        const element = typeof container === 'string' ? document.querySelector<HTMLDivElement>(container) : container;

        if (!element) {
            throw new Error('Container element could not be located.');
        }

        return element;
    }

    /**
     * Create the HTML container element for the HTML canvas element in which we
     * will draw the waveform.
     *
     * @returns {HTMLDivElement}
     */
    private createWaveContainer(): HTMLDivElement {
        const element = document.createElement('div');

        element.className = 'waveplayer-waveform-container';

        style(this._container.appendChild(element), {
            display: 'block',
            position: 'relative',
            width: this._options.responsive ? '100%' : `${this._options.width}px`,
            height: `${this._options.height}px`,
            overflow: 'hidden',
        });

        return element;
    }

    /**
     * Create the HTML canvas element in which we will draw the waveform.
     *
     * @returns {HTMLCanvasElement}
     */
    private createCanvas(): HTMLCanvasElement {
        const canvas = document.createElement('canvas');
        const { clientWidth } = this._waveContainer;

        style(this._waveContainer.appendChild(canvas), {
            position: 'absolute',
            top: '0',
            bottom: '0',
            zIndex: '1',
            height: `${this._options.height}px`,
            width: `${clientWidth}px`,
        });

        canvas.width = clientWidth;
        canvas.height = this._options.height;

        return canvas;
    }

    /**
     * Create the waveform and progress color variations.
     *
     * @returns {WaveViewColors}
     */
    private createColorVariations(): WaveViewColors {
        // eslint-disable-next-line require-jsdoc
        const createColorVariation = (color: string): [RgbColor, RgbColor] => {
            const rgb = hex2rgb(color);
            const hsv = rgb2hsv(rgb);

            return [rgb, hsv2rgb({ h: hsv.h, s: hsv.s, v: hsv.v * 1.4 })];
        };

        return {
            waveformColor: createColorVariation(this._options.waveformColor),
            progressColor: createColorVariation(this._options.progressColor),
        };
    }

    /**
     * Add a handler for the "resize" event.
     *
     * @returns {void}
     */
    private addResizeHandler(): void {
        style(this._waveContainer, { width: '100%' });

        if (this._resizeHandler) {
            window.removeEventListener('resize', this._resizeHandler);
        }

        this._resizeHandler = (): void => {
            throttle(() => {
                const width = this._waveContainer.clientWidth;

                style(this._canvas, { width: `${width}px` });
                this._canvas.width = width;

                this.draw();
            }, 250)();
        };

        window.addEventListener('resize', this._resizeHandler);
    }

    /**
     * Remove any existing handler for the "resize" event.
     *
     * @returns {void}
     */
    private removeResizeHandler(): void {
        if (this._resizeHandler) {
            window.removeEventListener('resize', this._resizeHandler);
        }

        style(this._waveContainer, { width: `${this._options.width}px` });
    }

    /**
     * Add a "click" event handler for the canvas object.
     *
     * @return {void}
     */
    private addClickHandler(): void {
        if (this._clickHandler) {
            this._canvas.removeEventListener('click', this._clickHandler);
        }

        this._clickHandler = (e: MouseEvent) => {
            this._progress = e.offsetX / this._waveContainer.clientWidth;

            this.clear();
            this.drawBars(...this.computeBarCoordinates(true));

            if (this._options.onClick) {
                this._options.onClick(e);
            }
        };

        this._canvas.addEventListener('click', this._clickHandler);
    }

    /**
     * Remove an existing "click" event handler for the canvas object.
     *
     * @return {void}
     */
    private removeClickHandler(): void {
        if (this._clickHandler) {
            this._canvas.removeEventListener('click', this._clickHandler);
        }
    }

    /**
     * @inheritdoc
     */
    public draw(): this {
        this.clear();
        this.drawBars(...this.computeBarCoordinates());

        return this;
    }

    /**
     * @inheritdoc
     */
    public clear(): this {
        const context = this._canvas.getContext('2d');

        if (context) {
            context.clearRect(0, 0, this._canvas.width, this._canvas.height);
        }

        return this;
    }

    /**
     * Compute the x, y coordinates for the individual bars representing a "unit"
     * of our waveform.
     *
     * @param {boolean} useCache
     * @returns {[number[], number[], number]}
     */
    private computeBarCoordinates(useCache = false): [number[], number[], number] {
        if (useCache && this._barCoordinates) {
            return this._barCoordinates;
        }

        const x = [];
        const y = [];
        const waveWidth = this._waveContainer.clientWidth;
        const totalBarWidth = this._options.barWidth + this._options.barGap;
        const incr = totalBarWidth * (this._data.length / waveWidth);

        for (let i = 0, j = 0; j + totalBarWidth < this._data.length; i += totalBarWidth, j += incr) {
            x.push(i);
            y.push(average(this._data, j, j + totalBarWidth));
        }

        this._barCoordinates = [x, y, 1 / Math.max(...y)];

        return this._barCoordinates;
    }

    /**
     * Draw the bars representing the waveform from the given coordinates.
     *
     * @param {number[]} x
     * @param {number[y]} y
     * @param {number} norm
     * @returns {void}
     */
    private drawBars(x: number[], y: number[], norm: number): void {
        const context = this._canvas.getContext('2d');

        if (!context) return;

        const progressCoordinate = this._progress * this._waveContainer.clientWidth;
        const totalBarWidth = this._options.barWidth + this._options.barGap;

        context.fillStyle = this._options.gradient
            ? this.createGradient(context, this._colors.progressColor)
            : this.createColor(this._colors.progressColor[0]);

        let i = 0;

        // Draw the part of the waveform that has been played already
        while (x[i] < progressCoordinate - totalBarWidth) {
            this.drawBar(context, x[i], y[i], norm);

            i++;
        }

        // Fade between colors when on currently playing bar
        while (x[i] < progressCoordinate) {
            const incr = (progressCoordinate - x[i]) / totalBarWidth;
            const progresIndicatorColor = this.createProgressIndicatorColorVariation(incr);

            context.fillStyle = this._options.gradient
                ? this.createGradient(context, progresIndicatorColor)
                : this.createColor(progresIndicatorColor[0]);

            this.drawBar(context, x[i], y[i], norm);

            i++;
        }

        context.fillStyle = this._options.gradient
            ? this.createGradient(context, this._colors.waveformColor)
            : this.createColor(this._colors.waveformColor[0]);

        // Draw the part of the waveform that has not been played yet
        while (i < x.length) {
            this.drawBar(context, x[i], y[i], norm);

            i++;
        }
    }

    /**
     * Draw a single bar at a given location.
     *
     * @param {CanvasRenderingContext2D} context
     * @param {number} x
     * @param {number} y
     * @param {number} norm
     * @returns {void}
     */
    private drawBar(context: CanvasRenderingContext2D, x: number, y: number, norm: number): void {
        const barHeight = Math.max(this._canvas.height * y * norm, 0.5);

        context.fillRect(x, (this._canvas.height - barHeight) / 2, this._options.barWidth, barHeight);
    }

    /**
     * Create the progress indicator color variation.
     *
     * @param {number} incr
     * @returns {RgbColor[]}
     */
    private createProgressIndicatorColorVariation(incr: number): [RgbColor, RgbColor] {
        const differenceColor = {
            r: this._colors.waveformColor[0].r - this._colors.progressColor[0].r,
            g: this._colors.waveformColor[0].g - this._colors.progressColor[0].g,
            b: this._colors.waveformColor[0].b - this._colors.progressColor[0].b,
        };
        const c1 = {
            r: this._colors.waveformColor[0].r - differenceColor.r * incr,
            g: this._colors.waveformColor[0].g - differenceColor.g * incr,
            b: this._colors.waveformColor[0].b - differenceColor.b * incr,
        };

        const tmp = rgb2hsv(c1);

        return [c1, hsv2rgb({ h: tmp.h, s: tmp.s, v: tmp.v * 1.4 })];
    }

    /**
     * Create a linear gradient from the provided color variation.
     *
     * @param {CanvasRenderingContext2D} context
     * @param {RgbColor[]} colorVariation
     * @returns {CanvasGradient}
     */
    private createGradient(context: CanvasRenderingContext2D, colorVariation: [RgbColor, RgbColor]): CanvasGradient {
        const gradient = context.createLinearGradient(0, 0, 0, context.canvas.height);
        const c1 = `rgba(${Object.values(colorVariation[1]).join(', ')}, 1)`;

        gradient.addColorStop(0.0, c1);
        gradient.addColorStop(0.3, `rgba(${Object.values(colorVariation[0]).join(', ')}, 1)`);
        gradient.addColorStop(1.0, c1);

        return gradient;
    }

    /**
     * Create a CSS color string from a given color object.
     *
     * @param {RgbColor} color
     * @returns {string}
     */
    private createColor(color: RgbColor): string {
        return `rgb(${Object.values(color).join(', ')})`;
    }

    /**
     * @inheritdoc
     */
    public destroy(): void {
        this.removeClickHandler();
        this.removeResizeHandler();
        this._container.removeChild(this._waveContainer);
    }
}

export default WaveView;
