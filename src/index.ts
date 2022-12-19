import WavePlayer from './WavePlayer';
import WaveView from './WaveView';
import { WavePlayerOptions } from './types/WavePlayer';
import { WaveView as WaveViewContract, WaveViewOptions } from './types/WaveView';

type Options = Readonly<Partial<WavePlayerOptions>> &
    Readonly<Partial<Omit<WaveViewOptions, 'container'>> & Pick<WaveViewOptions, 'container'>>;

/**
 * @class
 * @classdesc Wave player factory class.
 */
class Factory {
    /**
     * Create a new wave player instance.
     *
     * @param {(WavePlayerOptions&WaveViewOptions)} options
     * @return {WavePlayer}
     */
    public static create(options: Options): WavePlayer {
        const { audioElement, preload, ...waveViewOptions } = options;

        return new WavePlayer(new WaveView([], waveViewOptions), { audioElement, preload });
    }
}

export { Factory, WavePlayer, WaveView };
