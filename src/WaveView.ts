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

import { style } from './utils';

interface WaveViewOptions {
    container: HTMLDivElement | string;
    width: number;
    height: number;
    waveColor: string;
    progressColor: string;
    barWidth: number;
    barGap: number;
    interact: boolean;
    responsive: boolean;
    progress: number;
    useGradient: boolean;
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
        waveColor: '#428bca',
        progressColor: '#31708f',
        barWidth: 4,
        barGap: 1,
        interact: true,
        responsive: true,
        progress: 0,
        useGradient: true,
    };

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
     * Initialize a new wave view instance.
     *
     * @param {WaveViewOptions} options
     * @returns {void}
     */
    constructor(options: Readonly<Partial<Omit<WaveViewOptions, 'container'>> & Pick<WaveViewOptions, 'container'>>) {
        this._options = { ...WaveView._defaultOptions, ...options };
        this._container = this.resolveContainer();
        this._waveContainer = this.createWaveContainer();
        this._canvas = this.createCanvas();

        this._container.appendChild(this._waveContainer);
        this._waveContainer.appendChild(this._canvas);
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
     * Get the HTML container element for the waveview instance.
     *
     * @returns {HTMLDivElement}
     */
    public get container(): HTMLDivElement {
        return this._container;
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
}

export default WaveView;
export { WaveViewOptions };
