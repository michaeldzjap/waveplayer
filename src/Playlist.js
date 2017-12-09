/**
 * playlist.js
 *
 * © Michaël Dzjaparidze 2015
 * http://www.michaeldzjaparidze.com, https://github.com/michaeldzjap
 *
 * A HTML5 based audio player with a waveform view
 *
 * This work is licensed under the ISC License (ISC)
 */

import Mediator from './Mediator.js';
import WavePlayer from './WavePlayer.js';
import { stateResolver, isObject } from './lib/index.js';

class Playlist {

    /**
     * The default options for a new instance.
     *
     * @var {Object}
     */
    _defaultOptions = {
        autoPlay: false
    };

    /**
     * The options for this playlist instance.
     *
     * @var {Object}
     */
    _options;

    /**
     * The scheduler instance used for handling a playlist.
     *
     * @var {Object}
     */
    _scheduler;

    /**
     * The waveplayer instance associated with this playlist instance.
     *
     * @var {WavePlayer}
     */
    _wavePlayer;

    /**
     * The HTML audio element associated with a waveplayer instance.
     *
     * @var {audio}
     */
    _audioElm;

    /**
     * The number of the current track that is selected in the playlist.
     *
     * @var {Number}
     */
    _currentTrackNumber;

    /**
     * Initialize a new playlist instance.
     *
     * @param {audio} audioElm
     * @param {Array} urls
     * @param {Object} options
     * @return {void}
     */
    constructor(wavePlayer, urls, options = {}) {
        if (!urls || !(urls instanceof Array)) {
            throw new TypeError('Argument \'urls\' is invalid.');
        }

        if (urls.length === 0) {
            throw new Error('Argument \'urls\' needs to contain at least 1 item.');
        }

        if (!isObject(options)) {
            throw new TypeError('Argument \'options\' is invalid.');
        }

        // Create a new mediator if there does not exist one yet
        if (!WavePlayer._mediator) {
            WavePlayer._mediator = new Mediator;
        }

        // Merge any supplied options with default options
        this._options = {...this._defaultOptions, ...options};
        this._wavePlayer = wavePlayer;
        this._audioElm = this._wavePlayer._audioElm;
        this._scheduler = this._createScheduler(urls, this._options.autoplay);
    }

    next() {
        this._audioElm.dispatchEvent(new Event('ended'));
    }

    previous() {
        if (this._currentTrackNumber > 0) {
            this._currentTrackNumber -= 2;
        }
        this._audioElm.dispatchEvent(new Event('ended'));
    }

    /**
     * Destroy the playlist instance and do the appropriate clean up.
     *
     * @return {void}
     */
    destroy() {
        this._scheduler = null;
    }

    /**
     * Create a new scheduler for the playlist instance.
     *
     * @param {array} urls
     * @param {boolean} autoPlay
     * @return {Promise}
     */
    _createScheduler(urls, autoPlay) {
        this._currentTrackNumber = 0;
        const scheduler = stateResolver((function* (urls) {
            while (this._currentTrackNumber < urls.length) {
                yield this.load(urls[this._currentTrackNumber]);
                if (this._currentTrackNumber > 0) {
                    WavePlayer._mediator.fire(
                        'waveplayer:playlist:next',
                        this._wavePlayer,
                        {url: urls[this._currentTrackNumber], trackNumber: this._currentTrackNumber + 1}
                    );
                    this._wavePlayer.play();
                } else {
                    WavePlayer._mediator.fire('waveplayer:playlist:ready', this._wavePlayer);
                    if (autoPlay) {
                        this._wavePlayer.play();
                    }
                }
                // Wait until the current track finishes playing
                yield this._onEnd();
                this._currentTrackNumber++;
            }

            return this._currentTrackNumber;
        })).bind(this);

        this._scheduler(urls).then(
            response => WavePlayer._mediator.fire('waveplayer:playlist:finished', this._wavePlayer, response)
        );

        return scheduler;
    }

    /**
    * Return a promise that resolves itself when the HTML audio element fires an
    * 'ended' event (i.e. when an audio track finished playing).
    *
    * @return {Promise}
    */
    _onEnd() {
        return new Promise((resolve) => {
            if (this._ended) {
                this._audioElm.removeEventListener('ended', this._ended);
            }
            this._ended = () => resolve('ended');
            this._audioElm.addEventListener('ended', this._ended.bind(this));
        });
    }

}

export default Playlist;
