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

import { RgbColor } from './types';
import { average, hex2rgb, hsv2rgb, rgb2hsv, style } from './utils';

interface WaveViewOptions {
    container: HTMLDivElement | string;
    width: number;
    height: number;
    waveformColor: string;
    progressColor: string;
    barWidth: number;
    barGap: number;
    interact: boolean;
    responsive: boolean;
    gradient: boolean;
}

interface WaveViewColors {
    waveformColor: [RgbColor, RgbColor];
    progressColor: [RgbColor, RgbColor];
}

/**
 * @class
 * @classdesc Wave view class.
 */
class WaveView {
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
        interact: true,
        responsive: true,
        gradient: true,
    };

    /**
     * The amplitude data that will be used to draw the waveform. Assumed to be
     * in the range [-1.0, 1.0].
     *
     * @var {number[]}
     */
    private _data: number[];

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
        this._container = this.resolveContainer();
        this._waveContainer = this.createWaveContainer();
        this._canvas = this.createCanvas();
        this._colors = this.createColorVariations();

        this._container.appendChild(this._waveContainer);
        this._waveContainer.appendChild(this._canvas);
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
     * Set the waveform amplitude data.
     *
     * @param {number[]} data
     */
    public set data(data: number[]) {
        this._data = data;
    }

    /**
     * Get the progress of the waveform, assumed to be in the range [0-1].
     *
     * @returns {number}
     */
    public get progress(): number {
        return this._progress;
    }

    /**
     * Set the progress of the waveform, assumed to be in the range [0-1].
     *
     * @param {number} progress
     */
    public set progress(progress: number) {
        this._progress = Math.max(Math.min(progress, 1), 0);
    }

    /**
     * Get the HTML container element for the wave view instance.
     *
     * @returns {HTMLDivElement}
     */
    public get container(): HTMLDivElement {
        return this._container;
    }

    /**
     * Set the HTML container element for the wave view instance.
     *
     * @param {HTMLDivElement} element
     */
    public set container(element: HTMLDivElement) {
        this._container = element;
    }

    /**
     * Resolve an existing container HTML element.
     *
     * @returns {HTMLDivElement}
     */
    private resolveContainer(): HTMLDivElement {
        const element =
            typeof this._options.container === 'string'
                ? document.querySelector(this._options.container)
                : this._options.container;

        if (!element) {
            throw new Error('Container element could not located.');
        }

        if (element instanceof HTMLDivElement) {
            return element;
        }

        throw new Error('Container element is invalid.');
    }

    /**
     * Create the HTML container element for the HTML canvas element in which we
     * will draw the waveform.
     *
     * @returns {HTMLDivElement}
     */
    private createWaveContainer(): HTMLDivElement {
        const container = document.createElement('div');

        container.className = 'waveform-container';

        style(container, {
            display: 'block',
            position: 'relative',
            width: this._options.responsive ? '100%' : `${this._options.width}px`,
            height: `${this._options.height}px`,
            overflow: 'hidden',
        });

        return container;
    }

    /**
     * Create the HTML canvas element in which we will draw the waveform.
     *
     * @returns {HTMLCanvasElement}
     */
    private createCanvas(): HTMLCanvasElement {
        const canvas = document.createElement('canvas');
        const { clientWidth } = this._waveContainer;

        style(canvas, {
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
     * Draw the waveform in the canvas HTML element.
     *
     * @returns {this}
     */
    public render(): this {
        this.clear();
        this.drawBars();

        return this;
    }

    /**
     * Clear the canvas HTML element where the waveform is drawn in.
     *
     * @returns {this}
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
     * @returns {number[][]}
     */
    private computeBarCoordinates(): number[][] {
        const x = [];
        const y = [];
        const waveWidth = this._waveContainer.clientWidth;
        const totalBarWidth = this._options.barWidth + this._options.barGap;

        for (let i = 0; i < waveWidth; i += totalBarWidth) {
            x.push(i);
            y.push(average(this._data, i, i + totalBarWidth));
        }

        const norm = 1 / Math.max(...y);
        const waveHeight = this._canvas.height;

        for (let i = 0; i < y.length; i++) {
            y[i] = (waveHeight * (1 - y[i] * norm)) / 2;
        }

        return [x, y];
    }

    /**
     * Draw the bars representing the waveform from the given coordinates.
     *
     * @returns {void}
     */
    private drawBars(): void {
        const coordinates = this.computeBarCoordinates();
        const context = this._canvas.getContext('2d');
    }
}

export default WaveView;
export { WaveViewOptions };
