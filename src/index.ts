/**
 * Factory.ts
 *
 * © Michaël Dzjaparidze 2022
 * https://github.com/michaeldzjap
 *
 * Factory functionality for waveplayer
 *
 * This work is licensed under the MIT License (MIT)
 */

import Player from './Player';
import View from './View';
import { PlayerOptions } from './types/Player';
import { ViewOptions } from './types/View';

type Options = Readonly<Partial<PlayerOptions>> &
    Readonly<Partial<Omit<ViewOptions, 'container'>> & Pick<ViewOptions, 'container'>>;

/**
 * @class
 * @classdesc Factory class.
 */
class Factory {
    /**
     * Create a new player instance.
     *
     * @param {(PlayerOptions&ViewOptions)} options
     * @return {Player}
     */
    public static create(options: Options): Player {
        const { audioElement, preload, ...viewOptions } = options;

        return new Player(new View([], viewOptions), { audioElement, preload });
    }

    /**
     * Create a new playlist instance.
     *
     * @param {(PlayerOptions&ViewOptions)} options
     */
    public static createPlaylist(options: Options) {
        const { audioElement, preload, ...viewOptions } = options;
    }
}

export { Factory, Player, View };
