interface RgbColor {
    r: number;
    g: number;
    b: number;
}

interface HsvColor {
    h: number;
    s: number;
    v: number;
}

interface WavePlayerOptions {
    audioElement?: HTMLAudioElement | string;
    preload: '' | 'metadata' | 'none' | 'auto';
}

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
     * @returns {void}
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
     * @returns {void}
     */
    set height(value: number);

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
     * Draw the waveform in the canvas HTML element.
     *
     * @returns {this}
     */
    render(): this;

    /**
     * Clear the canvas HTML element where the waveform is drawn in.
     *
     * @returns {this}
     */
    clear(): this;
}

export { HsvColor, RgbColor, WavePlayerOptions, WaveView, WaveViewColors, WaveViewOptions };
