import Player from './Player';
import Playlist from './Playlist';
import type { PlayerOptions, Strategy } from './types/Player';
import type { ViewOptions } from './types/View';
import View from './View';

type Options = Readonly<Partial<PlayerOptions>> &
	Readonly<
		Partial<Omit<ViewOptions, 'container'>> & Pick<ViewOptions, 'container'>
	>;
declare class Factory {
	static createPlayer(options: Options): Player;
	static createPlaylist(
		tracks: Readonly<
			{
				url: string;
				strategy: Strategy;
			}[]
		>,
		options: Options,
	): Playlist;
}

export { Factory, Player, Playlist, View };
