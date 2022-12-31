import { Player } from './Player';

interface Playlist {
    /**
     * Get the associated player instance.
     *
     * @returns {Player}
     */
    get player(): Player;

    /**
     * Get the index of the currently playing track.
     *
     * @returns {number}
     */
    get current(): number;

    /**
     * Get the flag that indicates whether the playlist has finished playback.
     *
     * @returns {boolean}
     */
    get ended(): boolean;

    /**
     * Start playback of the playlist from the currently selected track.
     *
     * @returns {Promise<this>}
     */
    play(): Promise<this>;

    /**
     * Pause playback of the playlist.
     *
     * @returns {this}
     */
    pause(): this;

    /**
     * Prepare the playlist (alias for reset).
     *
     * @returns {Promise<this>}
     */
    prepare(): Promise<this>;

    /**
     * Pause playback and reset the playlist.
     *
     * @returns {Promise<this>}
     */
    reset(): Promise<this>;

    /**
     * Go to the next track in the playlist.
     *
     * @param {boolean} forcePlay
     * @returns {Promise<this>}
     */
    next(forcePlay: boolean): Promise<this>;

    /**
     * Go to the previous track in the playlist.
     *
     * @param {boolean} forcePlay
     * @returns {Promise<this>}
     */
    previous(forcePlay: boolean): Promise<this>;

    /**
     * Select a specific track in the playlist.
     *
     * @param {number} track
     * @param {boolean} forcePlay
     * @returns {Promise<this>}
     */
    select(track: number, forcePlay: boolean): Promise<this>;

    /**
     * Destroy the playlist instance and do the appropriate clean up.
     *
     * @returns {void}
     */
    destroy(): void;
}

export { Playlist };
