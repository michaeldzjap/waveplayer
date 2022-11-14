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
     * The HTML div element acting as a container for the waveview instance.
     *
     * @var {HTMLDivElement}
     */
    private container: HTMLDivElement;

    /**
     * Initialize a new waveview instance.
     *
     * @param {WaveViewOptions} options
     * @returns {void}
     */
    constructor(options: Readonly<Partial<Omit<WaveViewOptions, 'container'>> & Pick<WaveViewOptions, 'container'>>) {
        this.options = { ...WaveView.defaultOptions, ...options };
        this.container = this.resolveContainer();
    }

    /**
     * Resolve an existing container HTML element.
     *
     * @returns {HTMLDivElement}
     */
    private resolveContainer(): HTMLDivElement {
        const element =
            typeof this.options.container === 'string'
                ? document.querySelector(this.options.container)
                : this.options.container;

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
    getContainer(): HTMLDivElement {
        return this.container;
    }
}

export default WaveView;
export { WaveViewOptions };
