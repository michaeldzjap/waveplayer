import WavePlayer from './WavePlayer';
import WaveView from './WaveView';
import { WaveView as WaveViewContract, WaveViewOptions, WavePlayerOptions } from './types';

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
     * @param {(WaveView|undefined)} view
     * @return {WavePlayer}
     */
    public static create(options: Options, view?: WaveViewContract): WavePlayer {
        const { audioElement, preload, ...waveViewOptions } = options;

        return new WavePlayer(view ?? new WaveView([], waveViewOptions), { audioElement, preload });
    }
}

export { Factory, WavePlayer, WaveView };
