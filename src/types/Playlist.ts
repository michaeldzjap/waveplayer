import { Player } from './Player';

interface PlaylistOptions {
    onEnded?: (playlist: Playlist) => void;
}

interface Playlist {
    /**
     * Get the associated player instance.
     *
     * @returns {Player}
     */
    get player(): Player;

    /**
     * Get the details of the currently playing track.
     *
     * @returns {number}
     */
    get current(): number;

    /**
     * Get the "onEnded" callback.
     *
     * @returns {(Function|undefined)}
     */
    get onEnded(): ((playlist: Playlist) => void) | undefined;

    /**
     * Set the "onEnded" callback.
     *
     * @param {(Function|undefined)} callback
     */
    set onEnded(callback: ((playlist: Playlist) => void) | undefined);

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
     * Pause playback and reset the playlist.
     *
     * @returns {this}
     */
    reset(): this;

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

export { Playlist, PlaylistOptions };
