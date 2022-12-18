import { WaveView } from './WaveView';

interface Strategy {
    type: string;
}

interface DataStrategy extends Strategy {
    type: 'data';
    data: number[] | { [key: string]: number[] };
}

interface JsonStrategy extends Strategy {
    type: 'json';
    url: string;
}

interface WebAudioStrategy extends Strategy {
    type: 'webAudio';
    points?: number;
    normalise?: boolean;
    logarithmic?: boolean;
}

interface WavePlayerOptions {
    audioElement?: HTMLAudioElement | string;
    preload: '' | 'metadata' | 'none' | 'auto';
}

interface WavePlayer {
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
     * Get the associated wave view instance.
     *
     * @returns {WaveView}
     */
    get waveView(): WaveView;

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
     * @returns {Promise<void>}
     */
    play(): Promise<void>;

    /**
     * Pause audio playback.
     *
     * @returns {void}
     */
    pause(): void;

    /**
     * Move the playback header to a specific time in the audio file.
     *
     * @param {number} seconds
     * @returns {this}
     */
    skipTo(seconds: number): this;

    /**
     * Check if audio is currently playing.
     *
     * @returns {boolean}
     */
    paused(): boolean;

    /**
     * Destroy the wave player instance and do the appropriate clean up.
     *
     * @returns {void}
     */
    destroy(): void;
}

export { DataStrategy, JsonStrategy, WavePlayer, WavePlayerOptions, WebAudioStrategy, Strategy };
