/**
 * Factory.ts
 *
 * © Michaël Dzjaparidze 2023
 * https://github.com/michaeldzjap
 *
 * Factory functionality for waveplayer
 *
 * This work is licensed under the MIT License (MIT)
 */

import Player from './Player';
import Playlist from './Playlist';
import View from './View';
import type { PlayerOptions, Strategy } from './types/Player';
import type { ViewOptions } from './types/View';

type Options = Readonly<Partial<PlayerOptions>> &
	Readonly<
		Partial<Omit<ViewOptions, 'container'>> & Pick<ViewOptions, 'container'>
	>;

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
	public static createPlayer(options: Options): Player {
		const { audioElement, preload, ...viewOptions } = options;

		return new Player(new View([], viewOptions), { audioElement, preload });
	}

	/**
	 * Create a new playlist instance.
	 *
	 * @param {Object[]} tracks
	 * @param {(PlayerOptions&ViewOptions)} options
	 */
	public static createPlaylist(
		tracks: Readonly<{ url: string; strategy: Strategy }[]>,
		options: Options,
	) {
		const { audioElement, preload, ...viewOptions } = options;
		const player = new Player(new View([], viewOptions), {
			audioElement,
			preload,
		});

		return new Playlist(player, tracks);
	}
}

export { Factory, Player, Playlist, View };
