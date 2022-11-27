/**
 * WavePlayer.ts
 *
 * © Michaël Dzjaparidze 2022
 * https://github.com/michaeldzjap
 *
 * A HTML5 based audio player with a waveform view
 *
 * This work is licensed under the MIT License (MIT)
 */

import { WavePlayerOptions, WaveView } from './types';

/**
 * @class
 * @classdesc Wave player class.
 */
class WavePlayer {
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
        }
    }

    /**
     * Resolve an existing HTML audio element.
     *
     * @returns {HTMLAudioElement}
     */
    private resolveAudioElement(): HTMLAudioElement {
        const element =
            typeof this._options.audioElement === 'string'
                ? document.querySelector(this._options.audioElement)
                : this._options.audioElement;

        if (!element) {
            throw new Error('Audio element could not located.');
        }

        if (element instanceof HTMLAudioElement) {
            return element;
        }

        throw new Error('Audio element is invalid.');
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
     * @return {Promise<this>}
     */
    async initialise(): Promise<this> {
        return this;
    }
}

export default WavePlayer;
