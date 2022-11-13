import WaveView from './WaveView';

interface WavePlayerOptions {
    audioElement?: HTMLAudioElement;
    preload: '' | 'metadata' | 'none' | 'auto';
}

/**
 * @class
 * @classdesc Wave player class.
 */
class WavePlayer {
    /**
     * The default options for a new instance.
     *
     * @var {WavePlayerOptions}
     */
    private static defaultOptions: Readonly<Omit<WavePlayerOptions, 'audioElement'>> = {
        preload: 'metadata',
    };

    /**
     * The wave view instance associated with this wave player instance.
     *
     * @var {WaveView}
     */
    private view: WaveView;

    /**
     * The options for this waveplayer instance.
     *
     * @var {WavePlayerOptions}
     */
    private options: Readonly<WavePlayerOptions>;

    /**
     * The HTML audio element associated with this waveplayer instance.
     *
     * @var {HTMLAudioElement}
     */
    private audioElement: HTMLAudioElement;

    /**
     * Initialise a new wave player instance.
     *
     * @param {WaveView} view
     * @param {Options} options
     * @returns {void}
     */
    constructor(view: WaveView, options: Readonly<Partial<WavePlayerOptions>> = {}) {
        this.view = view;
        this.options = { ...WavePlayer.defaultOptions, ...options };

        if (this.options.audioElement) {
            this.audioElement = this.options.audioElement;
        } else {
            this.audioElement = this.createAudioElement();
        }
    }

    /**
     * Create a new HTML audio element.
     *
     * @returns {HTMLAudioElement}
     */
    private createAudioElement(): HTMLAudioElement {
        const audioElement = document.createElement('audio');
        audioElement.controls = false;
        audioElement.autoplay = false;
        audioElement.preload = this.options.preload;

        return audioElement;
    }

    /**
     * Initialise the wave player instance.
     *
     * @return {Promise<this>}
     */
    async initialise(): Promise<this> {
        return this;
    }
}

export default WavePlayer;
export { WavePlayerOptions };
