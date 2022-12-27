interface Playlist {
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
     * Skip to a specific track in the playlist.
     *
     * @param {number} track
     * @returns {Promise<this>}
     */
    skipTo(track: number): Promise<this>;

    /**
     * Destroy the playlist instance and do the appropriate clean up.
     *
     * @returns {void}
     */
    destroy(): void;
}

export { Playlist };
