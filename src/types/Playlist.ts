interface Playlist {
    /**
     * Go to the next track in the playlist.
     *
     * @returns {this}
     */
    next(): this;

    /**
     * Go to the previous track in the playlist.
     *
     * @returns {this}
     */
    previous(): this;

    /**
     * Skip to a specific track in the playlist.
     *
     * @param {number} track
     * @returns {this}
     */
    skipTo(track: number): this;

    /**
     * Destroy the playlist instance and do the appropriate clean up.
     *
     * @returns {void}
     */
    destroy(): void;
}

export { Playlist };
