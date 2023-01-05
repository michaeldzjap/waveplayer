/**
 * Player.ts
 *
 * © Michaël Dzjaparidze 2022
 * https://github.com/michaeldzjap
 *
 * An HTML5 based audio player with a waveform view
 *
 * This work is licensed under the MIT License (MIT)
 */

import { extractAmplitudes } from './audio';
import {
    DataStrategy,
    JsonStrategy,
    Player as PlayerContract,
    PlayerOptions,
    Strategy,
    WebAudioStrategy,
} from './types/Player';
import { View } from './types/View';
import { getJson } from './utils';

/**
 * Determine if the strategy is an instance of data strategy.
 *
 * @param {Strategy} strategy
 * @returns {boolean}
 */
const isDataStrategy = (strategy: Strategy): strategy is DataStrategy => {
    return strategy.type === 'data';
};

/**
 * Determine if the strategy is an instance of JSON strategy.
 *
 * @param {Strategy} strategy
 * @returns {boolean}
 */
const isJsonStrategy = (strategy: Strategy): strategy is JsonStrategy => {
    return strategy.type === 'json';
};

/**
 * Determine if the strategy is an instance of Web Audio strategy.
 *
 * @param {Strategy} strategy
 * @returns {boolean}
 */
const isWebAudioStrategy = (strategy: Strategy): strategy is WebAudioStrategy => {
    return strategy.type === 'webAudio';
};

/**
 * @class
 * @classdesc Player class.
 */
class Player implements PlayerContract {
    /**
     * The default options for a new instance.
     *
     * @var {PlayerOptions}
     */
    private static _defaultOptions: Readonly<Omit<PlayerOptions, 'audioElement'>> = {
        preload: 'metadata',
    };

    /**
     * The view instance associated with this player instance.
     *
     * @var {View}
     */
    private _view: View;

    /**
     * The options for this player instance.
     *
     * @var {PlayerOptions}
     */
    private _options: Readonly<PlayerOptions>;

    /**
     * The HTML audio element associated with this player instance.
     *
     * @var {HTMLAudioElement}
     */
    private _audioElement: HTMLAudioElement;

    /**
     * The handler function for the "canplay" event of the HTML audio element.
     *
     * @var {Function}
     */
    private _canPlayHandler?: () => void;

    /**
     * The handler function for the "timeupdate" event of the HTML audio element.
     *
     * @var {Function}
     */
    private _timeUpdateHandler?: (e: Event) => void;

    /**
     * The handler function for the "error" event of the HTML audio element.
     *
     * @var {Function}
     */
    private _errorHandler?: (e: Event) => void;

    /**
     * The handler function for the "click" event of the HTML canvas element.
     *
     * @var {Function}
     */
    private _clickHandler?: (e: Event) => void;

    /**
     * Create a new player instance.
     *
     * @param {View} view
     * @param {PlayerOptions} options
     */
    constructor(view: View, options: Readonly<Partial<PlayerOptions>> = {}) {
        this._view = view;
        this._options = { ...Player._defaultOptions, ...options };

        if (this._options.audioElement) {
            this._audioElement = this.resolveAudioElement();
        } else {
            this._audioElement = this.createAudioElement();

            this._view.container.appendChild(this._audioElement);
        }

        this.initialise();
    }

    /**
     * @inheritdoc
     */
    public get volume(): number {
        return this._audioElement.volume;
    }

    /**
     * @inheritdoc
     */
    public set volume(volume: number) {
        this._audioElement.volume = volume;
    }

    /**
     * @inheritdoc
     */
    public get currentTime(): number {
        return this._audioElement.currentTime;
    }

    /**
     * @inheritdoc
     */
    public set currentTime(currentTime: number) {
        this._audioElement.currentTime = currentTime;
    }

    /**
     * @inheritdoc
     */
    public get duration(): number {
        return this._audioElement.duration;
    }

    /**
     * @inheritdoc
     */
    public get paused(): boolean {
        return this._audioElement.paused;
    }

    /**
     * @inheritdoc
     */
    public get view(): View {
        return this._view;
    }

    /**
     * @inheritdoc
     */
    public get audioElement(): HTMLAudioElement {
        return this._audioElement;
    }

    /**
     * Resolve an existing HTML audio element.
     *
     * @returns {HTMLAudioElement}
     */
    private resolveAudioElement(): HTMLAudioElement {
        const element =
            typeof this._options.audioElement === 'string'
                ? document.querySelector<HTMLAudioElement>(this._options.audioElement)
                : this._options.audioElement;

        if (!element) {
            throw new Error('Audio element could not be located.');
        }

        element.controls = false;
        element.autoplay = false;
        element.preload = this._options.preload;

        return element;
    }

    /**
     * Create a new HTML audio element.
     *
     * @returns {HTMLAudioElement}
     */
    private createAudioElement(): HTMLAudioElement {
        const audioElement = document.createElement('audio');

        audioElement.controls = false;
        audioElement.autoplay = false;
        audioElement.preload = this._options.preload;

        return audioElement;
    }

    /**
     * Initialise the player instance.
     *
     * @return {this}
     */
    private initialise(): this {
        if (this._timeUpdateHandler && this._clickHandler) return this;

        this._timeUpdateHandler = (e: Event): void => {
            const element = e.currentTarget;

            if (!(element instanceof HTMLAudioElement)) return;

            this._view.progress = element.currentTime / this._audioElement.duration;
        };

        this._clickHandler = (): void => {
            this.currentTime = this._view.progress * this._audioElement.duration;
        };

        this._audioElement.addEventListener('timeupdate', this._timeUpdateHandler.bind(this));
        this._view.canvas.addEventListener('click', this._clickHandler.bind(this));

        return this;
    }

    /**
     * @inheritdoc
     */
    public async load(url: string, strategy: Strategy): Promise<this> {
        await Promise.all<this>([this.loadAudio(url), this.loadWaveform(url, strategy)]);

        return this;
    }

    /**
     * Load the audio from the given URL.
     *
     * @param {string} url
     * @returns {Promise<this>}
     */
    private loadAudio(url: string): Promise<this> {
        if (this._canPlayHandler && this._errorHandler) {
            this._audioElement.removeEventListener('canplay', this._canPlayHandler);
            this._audioElement.removeEventListener('error', this._errorHandler);
        }

        this._audioElement.src = url;
        this._audioElement.load();

        return new Promise((resolve, reject) => {
            this._canPlayHandler = (): void => resolve(this);
            this._errorHandler = (e: Event): void => {
                const element = e.currentTarget;

                if (!(element instanceof HTMLAudioElement)) return;

                const error = element.error;

                if (!error) return;

                switch (error.code) {
                    case error.MEDIA_ERR_ABORTED:
                        return reject(new Error('Fetching process aborted by user.'));
                    case error.MEDIA_ERR_NETWORK:
                        return reject(new Error('There was a problem downloading the audio file.'));
                    case error.MEDIA_ERR_DECODE:
                        return reject(new Error('There was a problem decoding the audio file.'));
                    case error.MEDIA_ERR_SRC_NOT_SUPPORTED:
                        return reject(new Error('The audio file is not supported.'));
                    default:
                        reject(new Error('An unknown error occurred.'));
                }
            };

            this._audioElement.addEventListener('canplay', this._canPlayHandler.bind(this));
            this._audioElement.addEventListener('error', this._errorHandler.bind(this));
        });
    }

    /**
     * Load the waveform data.
     *
     * @param {string} url
     * @param {Strategy} strategy
     * @returns {Promise<this>}
     */
    private async loadWaveform(url: string, strategy: Strategy): Promise<this> {
        if (isDataStrategy(strategy)) {
            this.applyDataStrategy(strategy);
        } else if (isJsonStrategy(strategy)) {
            this.applyJsonStrategy(strategy);
        } else if (isWebAudioStrategy(strategy)) {
            this.applyWebAudioStrategy(url, strategy);
        }

        return Promise.resolve(this);
    }

    /**
     * Draw the waveform using the data strategy.
     *
     * @param {DataStrategy} strategy
     * @returns {void}
     */
    private applyDataStrategy({ data }: { data: number[] | { [key: string]: number[] } }): void {
        this._view.data = Array.isArray(data) ? data : data[Object.keys(data)[0]];
    }

    /**
     * Draw the waveform using the JSON strategy.
     *
     * @param {JsonStrategy} strategy
     * @returns {Promise<void>}
     */
    private async applyJsonStrategy(strategy: JsonStrategy): Promise<void> {
        const { url, cache } = { ...{ cache: true }, ...strategy };

        const data = await this.resolveData(url, cache, () => {
            return getJson<number[] | { [key: string]: number[] }>(url);
        });

        this.applyDataStrategy({ data });
    }

    /**
     * Draw the waveform using the Web Audio strategy.
     *
     * @param {string} url
     * @param {WebAudioStrategy} strategy
     * @returns {Promise<void>}
     */
    private async applyWebAudioStrategy(url: string, strategy: WebAudioStrategy): Promise<void> {
        const { points, normalise, logarithmic, cache } = {
            ...{ points: 800, normalise: true, logarithmic: true, cache: true },
            ...strategy,
        };

        const data = await this.resolveData(url, cache, () => {
            return extractAmplitudes(url, { points, normalise, logarithmic });
        });

        this.applyDataStrategy({ data });
    }

    /**
     * Resolve amplitude data based on if it should be cached.
     *
     * @param {string} url
     * @param {boolean} cache
     * @param {Function} callback
     * @returns {Promise<number[]|Object>}
     */
    private async resolveData(
        url: string,
        cache: boolean,
        callback: () => Promise<number[] | { [key: string]: number[] }>,
    ): Promise<number[] | { [key: string]: number[] }> {
        const key = this.cacheKey(url);
        const data = cache && this.cachedDataExists(key) ? this.parseCachedData(key) : await callback();

        if (cache) {
            localStorage.setItem(key, JSON.stringify(data));
        }

        return data;
    }

    /**
     * Build the cache key for local storage.
     *
     * @param {string} key
     * @returns {string}
     */
    private cacheKey(key: string): string {
        return `waveplayer:${key}`;
    }

    /**
     * Determine whether cached data exists for the given key.
     *
     * @param {string} key
     * @returns {boolean}
     */
    private cachedDataExists(key: string): boolean {
        return localStorage.getItem(key) !== null;
    }

    /**
     * Parse existing cached amplitude data for a given key.
     *
     * @param {string} key
     * @returns {(number[]|Object)}
     */
    private parseCachedData(key: string): number[] | { [key: string]: number[] } {
        // eslint-disable-next-line require-jsdoc
        const guard = (data: unknown): data is number[] | { [key: string]: number[] } =>
            Array.isArray(data) || data !== null;
        const data = JSON.parse(localStorage.getItem(key) || '');

        return guard(data) ? data : [];
    }

    /**
     * @inheritdoc
     */
    public async play(): Promise<this> {
        await this._audioElement.play();

        return this;
    }

    /**
     * @inheritdoc
     */
    public pause(): this {
        this._audioElement.pause();

        return this;
    }

    /**
     * @inheritdoc
     */
    public destroy(): void {
        this.pause();

        if (this._timeUpdateHandler) {
            this._audioElement.removeEventListener('timeupdate', this._timeUpdateHandler);
        }

        if (this._canPlayHandler) {
            this._audioElement.removeEventListener('canplay', this._canPlayHandler);
        }

        if (this._errorHandler) {
            this._audioElement.removeEventListener('error', this._errorHandler);
        }

        if (this._clickHandler) {
            this._view.canvas.removeEventListener('click', this._clickHandler);
        }

        if (!this._options.audioElement) {
            this._view.container.removeChild(this._audioElement);
        }

        this._view.destroy();
    }
}

export default Player;
