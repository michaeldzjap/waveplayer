import type { Player } from './Player';

interface PlaylistOptions {
	forcePlay: boolean;
}
interface Playlist {
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
	destroy(): void;
}

export type { Playlist, PlaylistOptions };
