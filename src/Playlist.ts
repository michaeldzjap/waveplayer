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
     * The handler function for the "ended" event of the HTML audio element.
     *
     * @var {Function}
     */
    private _endedHandler?: () => void;

    /**
     * Create a new playlist instance.
     *
     * @param {Player} player
     * @param {Object[]} tracks
     */
    constructor(player: Player, tracks: Readonly<{ url: string; strategy: Strategy }[]>) {
        this._player = player;
        this._tracks = tracks;

        this.initialise();
    }

    /**
     * Initialise the playlist instance.
     *
     * @return {this}
     */
    private initialise(): this {
        if (this._endedHandler) return this;

        this._endedHandler = (): void => {
            if (this._currentTrack > this._tracks.length - 1) return;

            this._currentTrack++;

            this.loadAndPlayCurrentTrack();
        };

        return this;
    }

    /**
     * @inheritdoc
     */
    public async next(): Promise<this> {
        if (this._currentTrack < this._tracks.length - 1) {
            this._currentTrack++;

            await this.loadAndPlayCurrentTrack();
        }

        return this;
    }

    /**
     * @inheritdoc
     */
    public async previous(): Promise<this> {
        if (this._currentTrack > 0) {
            this._currentTrack--;

            await this.loadAndPlayCurrentTrack();
        }

        return this;
    }

    /**
     * @inheritdoc
     */
    public async skipTo(track: number): Promise<this> {
        if (track >= 0 && track < this._tracks.length) {
            this._currentTrack = track;

            await this.loadAndPlayCurrentTrack();
        }

        return this;
    }

    /**
     * Load and play the current track.
     *
     * @return {Promise<Player>}
     */
    private async loadAndPlayCurrentTrack(): Promise<Player> {
        this._player.pause();

        const { url, strategy } = this._tracks[this._currentTrack];

        await this._player.load(url, strategy);

        return this._player.play();
    }

    /**
     * @inheritdoc
     */
    public destroy(): void {
        this._player.destroy();
    }
}

export default Playlist;
