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
import { Playlist as PlaylistContract, PlaylistOptions } from './types/Playlist';

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
     * The options for this playlist instance.
     *
     * @var {PlaylistOptions}
     */
    private _options: Readonly<PlaylistOptions>;

    /**
     * The index of the currently playing track.
     *
     * @var {number}
     */
    private _current = 0;

    /**
     * Indicates whether the last track in the playlist has finished playing.
     *
     * @var {boolean}
     */
    private _ended = false;

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
     * @param {PlaylistOptions} options
     */
    constructor(
        player: Player,
        tracks: Readonly<{ url: string; strategy: Strategy }[]>,
        options: Readonly<Partial<PlaylistOptions>> = {},
    ) {
        if (!tracks.length) {
            throw new Error('A playlist needs to contain at least one track.');
        }

        this._player = player;
        this._tracks = tracks;
        this._options = options;

        this.initialise();
    }

    /**
     * Initialise the playlist instance.
     *
     * @return {this}
     */
    private initialise(): this {
        if (this._endedHandler) return this;

        this._endedHandler = async (): Promise<void> => {
            await this.next();

            if (this._ended && this._options.onEnded) {
                this._options.onEnded(this);
            }
        };

        this._player.audioElement.addEventListener('ended', this._endedHandler.bind(this));

        return this;
    }

    /**
     * @inheritdoc
     */
    public get player(): Player {
        return this._player;
    }

    /**
     * @inheritdoc
     */
    public get current(): number {
        return this._current;
    }

    /**
     * @inheritdoc
     */
    get onEnded(): ((playlist: PlaylistContract) => void) | undefined {
        return this._options.onEnded;
    }

    /**
     * @inheritdoc
     */
    set onEnded(callback: ((playlist: PlaylistContract) => void) | undefined) {
        this._options = { ...this._options, onEnded: callback };
    }

    /**
     * @inheritdoc
     */
    public async play(): Promise<this> {
        if (!this._player.paused()) return this;

        await this.handleCurrentTrack(false);
        await this._player.play();

        return this;
    }

    /**
     * @inheritdoc
     */
    public pause(): this {
        if (this._player.paused()) return this;

        this._player.pause();

        return this;
    }

    /**
     * @inheritdoc
     */
    public reset(): this {
        this.pause();

        this._current = 0;
        this._ended = false;

        this.handleCurrentTrack(false);

        return this;
    }

    /**
     * @inheritdoc
     */
    public async next(forcePlay = true): Promise<this> {
        if (this._current < this._tracks.length - 1) {
            this._current++;
            this._ended = false;

            await this.handleCurrentTrack(forcePlay);
        } else {
            this._ended = true;
        }

        return this;
    }

    /**
     * @inheritdoc
     */
    public async previous(forcePlay = true): Promise<this> {
        if (this._current > 0) {
            this._current--;
            this._ended = false;

            await this.handleCurrentTrack(forcePlay);
        }

        return this;
    }

    /**
     * @inheritdoc
     */
    public async select(track: number, forcePlay = true): Promise<this> {
        if (track >= 0 && track < this._tracks.length) {
            this._current = track;
            this._ended = false;

            await this.handleCurrentTrack(forcePlay);
        }

        return this;
    }

    /**
     * Load and play the current track.
     *
     * @param {boolean} forcePlay
     * @return {Promise<void>}
     */
    private async handleCurrentTrack(forcePlay: boolean): Promise<void> {
        const isPaused = this._player.paused();

        this._player.pause();

        const { url, strategy } = this._tracks[this._current];

        await this._player.load(url, strategy);

        if (forcePlay || !isPaused) {
            this._player.play();
        }
    }

    /**
     * @inheritdoc
     */
    public destroy(): void {
        if (this._endedHandler) {
            this._player.audioElement.removeEventListener('ended', this._endedHandler);
        }

        this._player.destroy();
    }
}

export default Playlist;
