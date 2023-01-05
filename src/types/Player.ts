import { View } from './View';

interface DataStrategy {
    type: 'data';
    data: number[] | { [key: string]: number[] };
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
    preload: '' | 'metadata' | 'none' | 'auto';
}

interface Player {
    /**
     * Get the volume of the currently playing audio file.
     *
     * @returns {number}
     */
    get volume(): number;

    /**
     * Set the volume of the currently playing audio file.
     *
     * @param {number} volume
     */
    set volume(volume: number);

    /**
     * Get the current playback time in seconds.
     *
     * @returns {number}
     */
    get currentTime(): number;

    /**
     * Set the current playback time in seconds.
     *
     * @param {number} currentTime
     */
    set currentTime(currentTime: number);

    /**
     * Get the duration of the currently playing audio file.
     *
     * @returns {number}
     */
    get duration(): number;

    /**
     * Get the flag that checks if audio playback is currently paused.
     *
     * @returns {boolean}
     */
    get paused(): boolean;

    /**
     * Get the view instance associated with the player.
     *
     * @returns {View}
     */
    get view(): View;

    /**
     * Get the HTML audio element associated with the player.
     *
     * @returns {HTMLAudioElement}
     */
    get audioElement(): HTMLAudioElement;

    /**
     * Load an audio file from a given URL.
     *
     * @param {string} url
     * @param {Strategy} strategy
     * @returns {Promise<this>}
     */
    load(url: string, strategy: Strategy): Promise<this>;

    /**
     * Start audio playback.
     *
     * @returns {Promise<this>}
     */
    play(): Promise<this>;

    /**
     * Pause audio playback.
     *
     * @returns {this}
     */
    pause(): this;

    /**
     * Destroy the player instance and do the appropriate clean up.
     *
     * @returns {void}
     */
    destroy(): void;
}

export { DataStrategy, JsonStrategy, Player, PlayerOptions, Strategy, WebAudioStrategy };
