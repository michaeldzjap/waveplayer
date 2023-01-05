import { Player } from './Player';

interface PlaylistOptions {
    forcePlay: boolean;
}

interface Playlist {
    /**
     * Get the flag that indicates whether playback should start after selecting
     * another track in the playlist, regardless if the playlist is paused or not.
     *
     * @returns {boolean}
     */
    get forcePlay(): boolean;

    /**
     * Set the flag that indicates whether playback should start after selecting
     * another track in the playlist, regardless if the playlist is paused or not.
     *
     * @param {boolean} forcePlay
     */
    set forcePlay(forcePlay: boolean);

    /**
     * Get the player instance associated with the playlist.
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
     * @returns {Promise<this>}
     */
    next(): Promise<this>;

    /**
     * Go to the previous track in the playlist.
     *
     * @returns {Promise<this>}
     */
    previous(): Promise<this>;

    /**
     * Select a specific track in the playlist.
     *
     * @param {number} track
     * @returns {Promise<this>}
     */
    select(track: number): Promise<this>;

    /**
     * Destroy the playlist instance and do the appropriate clean up.
     *
     * @returns {void}
     */
    destroy(): void;
}

export { Playlist, PlaylistOptions };
