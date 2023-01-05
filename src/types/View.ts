import { RgbColor } from './utils';

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
    /**
     * Get the waveform amplitude data.
     *
     * @returns {number[]}
     */
    get data(): number[];

    /**
     * Set the waveform amplitude data.
     *
     * @param {number[]} data
     */
    set data(data: number[]);

    /**
     * Get the progress of the waveform, assumed to be in the range [0-1].
     *
     * @returns {number}
     */
    get progress(): number;

    /**
     * Set the progress of the waveform, assumed to be in the range [0-1].
     *
     * @param {number} progress
     */
    set progress(progress: number);

    /**
     * Get the HTML container element for the view instance.
     *
     * @returns {HTMLDivElement}
     */
    get container(): HTMLDivElement;

    /**
     * Set the HTML container element for the view instance.
     *
     * @param {(HTMLDivElement|string)} element
     */
    set container(element: HTMLDivElement | string);

    /**
     * Get the width of the drawn waveform.
     *
     * @returns {number}
     */
    get width(): number;

    /**
     * Set the width of the drawn waveform. Only has an effect if the view instance
     * is not operating in responsive mode.
     *
     * @param {number} width
     */
    set width(width: number);

    /**
     * Get the height of the drawn waveform.
     *
     * @returns {number}
     */
    get height(): number;

    /**
     * Set the height of the drawn waveform.
     *
     * @param {number} height
     */
    set height(height: number);

    /**
     * Get the width of a bar representing an element of the waveform.
     *
     * @returns {number}
     */
    get barWidth(): number;

    /**
     * Set the width of a bar representing an element of the waveform.
     *
     * @param {number} barWidth
     */
    set barWidth(barWidth: number);

    /**
     * Get the width of the gap that separates consecutive bars.
     *
     * @returns {number}
     */
    get barGap(): number;

    /**
     * Set the width of the gap that separates consecutive bars.
     *
     * @param {number} barGap
     */
    set barGap(barGap: number);

    /**
     * Get the flag that determines if the view instance is operating in responsive mode.
     *
     * @returns {boolean}
     */
    get responsive(): boolean;

    /**
     * Make the view instance responsive, meaning its width should scale along
     * with the width of its parent container.
     *
     * @param {boolean} responsive
     */
    set responsive(responsive: boolean);

    /**
     * Get the flag that determines if the waveform should be drawn with a gradient.
     *
     * @returns {boolean}
     */
    get gradient(): boolean;

    /**
     * Set the flag that determines if the waveform should be drawn with a gradient.
     *
     * @param {boolean} gradient
     */
    set gradient(gradient: boolean);

    /**
     * Get the interaction state of the view instance.
     *
     * @returns {boolean}
     */
    get interact(): boolean;

    /**
     * Set the interaction state of the view instance.
     *
     * @param {boolean} interact
     */
    set interact(interact: boolean);

    /**
     * Get the redraw flag. This flag determines whether the waveform should be
     * redrawn when setting one of the view properties that affects the look of
     * the waveform (e.g. width, height, gradient).
     *
     * @returns {boolean}
     */
    get redraw(): boolean;

    /**
     * Set the redraw flag.
     *
     * @param {boolean} redraw
     */
    set redraw(redraw: boolean);

    /**
     * Get the HTML canvas element that is used for drawing the waveform.
     *
     * @returns {HTMLCanvasElement}
     */
    get canvas(): HTMLCanvasElement;

    /**
     * Draw the waveform on the canvas HTML element.
     *
     * @returns {this}
     */
    draw(): this;

    /**
     * Clear the canvas HTML element where the waveform is drawn on.
     *
     * @returns {this}
     */
    clear(): this;

    /**
     * Destroy the view instance and do the appropriate clean up.
     *
     * @returns {void}
     */
    destroy(): void;
}

export { View, ViewColors, ViewOptions };
