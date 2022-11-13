import { WaveViewOptions } from './WaveView';

interface WavePlayerOptions {
    preload: string;
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
    private static defaultOptions: WavePlayerOptions = {
        preload: 'metadata',
    };

    /**
     * The options for this waveplayer instance.
     *
     * @var {(WavePlayerOptions&WaveViewOptions)}
     */
    private options: Readonly<WavePlayerOptions>;

    /**
     * Initialize a new waveplayer instance.
     *
     * @param {Options} options
     * @returns {void}
     */
    constructor(options: Readonly<Partial<WavePlayerOptions & WaveViewOptions>> = {}) {
        this.options = { ...WavePlayer.defaultOptions, ...options };
    }
}

export default WavePlayer;
export { WavePlayerOptions };
