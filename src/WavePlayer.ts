/**
 * WavePlayer.ts
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
    WavePlayer as WavePlayerContract,
    WavePlayerOptions,
    Strategy,
    DataStrategy,
    JsonStrategy,
    WebAudioStrategy,
} from './types/WavePlayer';
import { WaveView } from './types/WaveView';
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
 * @classdesc Wave player class.
 */
class WavePlayer implements WavePlayerContract {
    /**
     * The default options for a new instance.
     *
     * @var {WavePlayerOptions}
     */
    private static _defaultOptions: Readonly<Omit<WavePlayerOptions, 'audioElement'>> = {
        preload: 'metadata',
    };

    /**
     * The wave view instance associated with this wave player instance.
     *
     * @var {WaveView}
     */
    private _view: WaveView;

    /**
     * The options for this waveplayer instance.
     *
     * @var {WavePlayerOptions}
     */
    private _options: Readonly<WavePlayerOptions>;

    /**
     * The HTML audio element associated with this waveplayer instance.
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
     * Initialise a new wave player instance.
     *
     * @param {WaveView} view
     * @param {Options} options
     */
    constructor(view: WaveView, options: Readonly<Partial<WavePlayerOptions>> = {}) {
        this._view = view;
        this._options = { ...WavePlayer._defaultOptions, ...options };

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
    public set volume(value: number) {
        this._audioElement.volume = value;
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
    public set currentTime(value: number) {
        this._audioElement.currentTime = value;
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
    public get waveView(): WaveView {
        return this._view;
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
     * Initialise the wave player instance.
     *
     * @return {this}
     */
    private initialise(): this {
        if (this._timeUpdateHandler && this._view.onClick) return this;

        this._timeUpdateHandler = (e: Event): void => {
            const element = e.currentTarget;

            if (!(element instanceof HTMLAudioElement)) return;

            this._view.progress = element.currentTime / this._audioElement.duration;
        };

        this._audioElement.addEventListener('timeupdate', this._timeUpdateHandler.bind(this));

        this._view.onClick = () => {
            this.skipTo(this._view.progress * this._audioElement.duration);
        };

        return this;
    }

    /**
     * @inheritdoc
     */
    public async load<T extends Strategy>(url: string, strategy: T): Promise<this> {
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
        this._audioElement.src = url;
        this._audioElement.load();

        if (this._canPlayHandler && this._errorHandler) {
            return Promise.resolve(this);
        }

        return new Promise((resolve, reject) => {
            this._canPlayHandler = (): void => resolve(this);
            this._errorHandler = (e: Event): void => {
                const element = e.currentTarget;

                if (!(element instanceof HTMLAudioElement)) return;

                const error = element.error;

                if (!error) return;

                switch (error.code) {
                    case error.MEDIA_ERR_ABORTED:
                        return reject(new Error('Fetching process aborted by user'));
                    case error.MEDIA_ERR_NETWORK:
                        return reject(new Error('There was a problem downloading the audio file'));
                    case error.MEDIA_ERR_DECODE:
                        return reject(new Error('There was a problem decoding the audio file'));
                    case error.MEDIA_ERR_SRC_NOT_SUPPORTED:
                        return reject(new Error('Audio is not supported, check the provided URL'));
                    default:
                        reject(new Error('An unknown error occurred'));
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
    private async loadWaveform<T extends Strategy>(url: string, strategy: T): Promise<this> {
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
    private async applyJsonStrategy({ url }: { url: string }): Promise<void> {
        const data = await getJson<number[] | { [key: string]: number[] }>(url);

        this.applyDataStrategy({ data });
    }

    /**
     * Draw the waveform using the Web Audio strategy.
     *
     * @param {string} url
     * @param {WebAudioStrategy} strategy
     * @returns {Promise<void>}
     */
    private async applyWebAudioStrategy(
        url: string,
        { points, normalise, logarithmic }: Partial<{ points: number; normalise: boolean; logarithmic: boolean }>,
    ): Promise<void> {
        const data = await extractAmplitudes(url, { points, normalise, logarithmic });

        this.applyDataStrategy({ data });
    }

    /**
     * @inheritdoc
     */
    public play(): Promise<void> {
        return this._audioElement.play();
    }

    /**
     * @inheritdoc
     */
    public pause(): void {
        return this._audioElement.pause();
    }

    /**
     * @inheritdoc
     */
    public skipTo(seconds: number): this {
        this._audioElement.currentTime = seconds;

        return this;
    }

    /**
     * @inheritdoc
     */
    public paused(): boolean {
        return this._audioElement.paused;
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

        if (!this._options.audioElement) {
            this._view.container.removeChild(this._audioElement);
        }

        this._view.destroy();
    }
}

export default WavePlayer;
