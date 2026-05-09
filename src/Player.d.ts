import type {
	Player as PlayerContract,
	PlayerOptions,
	Strategy,
} from './types/Player';
import type { View } from './types/View';

declare class Player implements PlayerContract {
	private static _defaultOptions;
	private _view;
	private _options;
	private _audioElement;
	private _canPlayHandler?;
	private _timeUpdateHandler?;
	private _errorHandler?;
	private _clickHandler?;
	constructor(view: View, options?: Readonly<Partial<PlayerOptions>>);
	get volume(): number;
	set volume(volume: number);
	get currentTime(): number;
	set currentTime(currentTime: number);
	get duration(): number;
	get paused(): boolean;
	get view(): View;
	get audioElement(): HTMLAudioElement;
	private resolveAudioElement;
	private createAudioElement;
	private initialise;
	load(url: string, strategy: Strategy): Promise<this>;
	private loadAudio;
	private loadWaveform;
	private applyDataStrategy;
	private applyJsonStrategy;
	private applyWebAudioStrategy;
	private resolveData;
	private cacheKey;
	private cachedDataExists;
	private parseCachedData;
	play(): Promise<this>;
	pause(): this;
	destroy(): void;
}
export default Player;
