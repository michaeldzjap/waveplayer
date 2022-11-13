interface WaveViewOptions {
    container: HTMLElement;
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
     * The default options for a new instance.
     *
     * @var {WaveViewOptions}
     */
    private static defaultOptions: Readonly<Omit<WaveViewOptions, 'container'>> = {
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
     * The options for this waveplayer instance.
     *
     * @var {WaveViewOptions}
     */
    private options: Readonly<WaveViewOptions>;

    /**
     * The HTML container element for the waveview instance.
     *
     * @var {HTMLElement}
     */
    private container: HTMLElement;

    /**
     * Initialize a new waveview instance.
     *
     * @param {WaveViewOptions} options
     * @returns {void}
     */
    constructor(options: Readonly<Partial<Omit<WaveViewOptions, 'container'>> & Pick<WaveViewOptions, 'container'>>) {
        this.options = { ...WaveView.defaultOptions, ...options };
        this.container = this.options.container;
    }

    /**
     * Get the HTML container element for the waveview instance.
     *
     * @returns {HTMLElement}
     */
    getContainer(): HTMLElement {
        return this.container;
    }
}

export default WaveView;
export { WaveViewOptions };
