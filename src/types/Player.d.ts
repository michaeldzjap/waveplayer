import type { View } from './View';

interface DataStrategy {
	type: 'data';
	data:
		| number[]
		| {
				[key: string]: number[];
		  };
}
interface JsonStrategy {
	type: 'json';
	url: string;
	cache?: boolean;
}
interface WebAudioStrategy {
	type: 'webAudio';
	points?: number;
	normalise?: boolean;
	logarithmic?: boolean;
	cache?: boolean;
}
type Strategy = DataStrategy | JsonStrategy | WebAudioStrategy;
interface PlayerOptions {
	audioElement?: HTMLAudioElement | string;
	preload: 'metadata' | 'none' | 'auto';
}
interface Player {
	get volume(): number;
	set volume(volume: number);
	get currentTime(): number;
	set currentTime(currentTime: number);
	get duration(): number;
	get paused(): boolean;
	get view(): View;
	get audioElement(): HTMLAudioElement;
	load(url: string, strategy: Strategy): Promise<this>;
	play(): Promise<this>;
	pause(): this;
	destroy(): void;
}

export type {
	DataStrategy,
	JsonStrategy,
	Player,
	PlayerOptions,
	Strategy,
	WebAudioStrategy,
};
