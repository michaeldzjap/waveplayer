import { View } from './View';

interface Strategy {
    type: string;
}

interface PlayerOptions {
    audioElement?: HTMLAudioElement | string;
    preload: '' | 'metadata' | 'none' | 'auto';
}

interface Player {
    /**
     * Get the volume of the currently loaded / playing track.
     *
     * @returns {number}
     */
    get volume(): number;

    /**
     * Set the volume of the currently loaded / playing track.
     *
     * @param  {number} value
     */
    set volume(value: number);

    /**
     * Get the current playback time in seconds.
     *
     * @returns {number}
     */
    get currentTime(): number;

    /**
     * Set the current playback time in seconds.
     *
     * @param {number} value
     */
    set currentTime(value: number);

    /**
     * Get the duration of the currently loaded / playing track.
     *
     * @returns {number}
     */
    get duration(): number;

    /**
     * Check if audio playback is currently paused.
     *
     * @returns {boolean}
     */
    get paused(): boolean;

    /**
     * Get the associated view instance.
     *
     * @returns {View}
     */
    get view(): View;

    /**
     * Get the HTML audio element..
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
     * Move the playback header to a specific time in the audio file.
     *
     * @param {number} seconds
     * @returns {this}
     */
    skipTo(seconds: number): this;

    /**
     * Destroy the player instance and do the appropriate clean up.
     *
     * @returns {void}
     */
    destroy(): void;
}

export { Player, PlayerOptions, Strategy };
