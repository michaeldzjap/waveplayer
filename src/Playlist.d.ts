import type { Player, Strategy } from './types/Player';
import type {
	Playlist as PlaylistContract,
	PlaylistOptions,
} from './types/Playlist';

declare class Playlist implements PlaylistContract {
	private static _defaultOptions;
	private _options;
	private _player;
	private _tracks;
	private _current;
	private _ended;
	private _endedHandler?;
	constructor(
		player: Player,
		tracks: Readonly<
			{
				url: string;
				strategy: Strategy;
			}[]
		>,
		options?: Readonly<Partial<PlaylistOptions>>,
	);
	private initialise;
	get forcePlay(): boolean;
	set forcePlay(forcePlay: boolean);
	get player(): Player;
	get current(): number;
	get ended(): boolean;
	play(): Promise<this>;
	pause(): this;
	prepare(): Promise<this>;
	reset(): Promise<this>;
	next(): Promise<this>;
	previous(): Promise<this>;
	select(track: number): Promise<this>;
	private handleCurrentTrack;
	destroy(): void;
}
export default Playlist;
