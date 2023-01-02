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

import Player, { DataStrategy, JsonStrategy, WebAudioStrategy } from './Player';
import Playlist from './Playlist';
import View from './View';
import { PlayerOptions, Strategy } from './types/Player';
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
     * @param {Object[]} tracks
     * @param {(PlayerOptions&ViewOptions)} options
     */
    public static createPlaylist(tracks: Readonly<{ url: string; strategy: Strategy }[]>, options: Options) {
        const { audioElement, preload, ...viewOptions } = options;
        const player = new Player(new View([], viewOptions), { audioElement, preload });

        return new Playlist(player, tracks);
    }
}

export { DataStrategy, Factory, JsonStrategy, Player, Playlist, View, WebAudioStrategy };
