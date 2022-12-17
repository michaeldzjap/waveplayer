import { RgbColor } from './utils';

interface WaveViewOptions {
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
    onClick?: (e: MouseEvent) => void;
}

interface WaveViewColors {
    waveformColor: [RgbColor, RgbColor];
    progressColor: [RgbColor, RgbColor];
}

interface WaveView {
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
     * Get the HTML container element for the wave view instance.
     *
     * @returns {HTMLDivElement}
     */
    get container(): HTMLDivElement;

    /**
     * Set the HTML container element for the wave view instance.
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
     * Set the width of the drawn waveform. Only has an effect if the wave view
     * instance is not operating in responsive mode.
     *
     * @param {number} value
     */
    set width(value: number);

    /**
     * Get the height of the drawn waveform.
     *
     * @returns {number}
     */
    get height(): number;

    /**
     * Set the height of the drawn waveform.
     *
     * @param {number} value
     */
    set height(value: number);

    /**
     * Get the width of a bar representing an element of the waveform.
     *
     * @returns {number}
     */
    get barWidth(): number;

    /**
     * Set the width of a bar representing an element of the waveform.
     *
     * @param {number} value
     */
    set barWidth(value: number);

    /**
     * Get the width of the gap that separates consecutive bars.
     *
     * @returns {number}
     */
    get barGap(): number;

    /**
     * Set the width of the gap that separates consecutive bars.
     *
     * @param {number} value
     */
    set barGap(value: number);

    /**
     * Check if the wave view instance is operating in responsive mode.
     *
     * @returns {boolean}
     */
    get responsive(): boolean;

    /**
     * Make the wave view instance responsive, meaning its width should scale
     * along with the width of its parent container.
     *
     * @param {boolean} value
     */
    set responsive(value: boolean);

    /**
     * Determines if the waveform should be drawn with a gradient.
     *
     * @returns {boolean}
     */
    get gradient(): boolean;

    /**
     * Determine if the waveform should be drawn with a gradient.
     *
     * @param {boolean} value
     */
    set gradient(value: boolean);

    /**
     * Check if we can currently interact with the wave view instance.
     *
     * @returns {boolean}
     */
    get interact(): boolean;

    /**
     * Set the interaction state of the wave view instance.
     *
     * @param {boolean} value
     */
    set interact(value: boolean);

    /**
     * Get the callback that should be evaluated when the user clicks somewhere
     * on the waveform.
     *
     * @returns {(Function|undefined)}
     */
    get onClick(): ((e: MouseEvent) => void) | undefined;

    /**
     * Set the callback that should be evaluated when the user clicks somewhere
     * on the waveform.
     *
     * NOTE: The callback will only be evaluated when the "interact" flag is set
     * to `true`.
     *
     * @param {(Function|undefined)} callback
     */
    set onClick(callback: ((e: MouseEvent) => void) | undefined);

    /**
     * Draw the waveform in the canvas HTML element.
     *
     * @returns {this}
     */
    draw(): this;

    /**
     * Clear the canvas HTML element where the waveform is drawn in.
     *
     * @returns {this}
     */
    clear(): this;
}

export { WaveView, WaveViewColors, WaveViewOptions };
