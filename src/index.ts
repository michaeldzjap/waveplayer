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
import type { PlayerOptions, Strategy } from './types/Player';
import type { ViewOptions } from './types/View';
import { pick } from './utils';
import View from './View';

type Options = Readonly<Partial<PlayerOptions>> &
	Readonly<
		Partial<Omit<ViewOptions, 'container'>> & Pick<ViewOptions, 'container'>
	>;

const PLAYER_OPTIONS: (keyof PlayerOptions)[] = ['audioElement', 'preload'];
const VIEW_OPTIONS: (keyof ViewOptions)[] = [
	'container',
	'width',
	'height',
	'waveformColor',
	'progressColor',
	'barWidth',
	'barGap',
	'responsive',
	'gradient',
	'interact',
	'redraw',
];

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
		return new Player(
			new View([], pick(options, VIEW_OPTIONS)),
			pick(options, PLAYER_OPTIONS),
		);
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
		const player = new Player(
			new View([], pick(options, VIEW_OPTIONS)),
			pick(options, PLAYER_OPTIONS),
		);

		return new Playlist(player, tracks);
	}
}

export { Factory, Player, Playlist, View };
