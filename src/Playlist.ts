/**
 * Playlist.ts
 *
 * © Michaël Dzjaparidze 2022
 * https://github.com/michaeldzjap
 *
 * Playlist functionality for waveplayer
 *
 * This work is licensed under the MIT License (MIT)
 */

import { Player, Strategy } from './types/Player';
import { Playlist as PlaylistContract } from './types/Playlist';

/**
 * @class
 * @classdesc Playlist class.
 */
class Playlist implements PlaylistContract {
    /**
     * The player instance associated with this playlist instance.
     *
     * @var {Player}
     */
    private _player: Player;

    /**
     * The track information for the playlist.
     *
     * @var {Object}
     */
    private _tracks: Readonly<{ url: string; strategy: Strategy }[]>;

    /**
     * The index of the currently playing track.
     *
     * @var {number}
     */
    private _currentTrack = 0;

    /**
     * Create a new playlist instance.
     *
     * @param {Player} player
     * @param {Object[]} tracks
     */
    constructor(player: Player, tracks: Readonly<{ url: string; strategy: Strategy }[]>) {
        this._player = player;
        this._tracks = tracks;
    }

    /**
     * @inheritdoc
     */
    public next(): this {
        if (this._currentTrack < this._tracks.length - 1) {
            this._currentTrack++;
        }

        return this;
    }

    /**
     * @inheritdoc
     */
    public previous(): this {
        if (this._currentTrack > 0) {
            this._currentTrack--;
        }

        return this;
    }

    /**
     * @inheritdoc
     */
    public skipTo(track: number): this {
        if (track >= 0 && track < this._tracks.length) {
            this._currentTrack = track;
        }

        return this;
    }

    /**
     * @inheritdoc
     */
    public destroy(): void {
        this._player.destroy();
    }
}

export default Playlist;
