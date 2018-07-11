/**
 * Playlist.js
 *
 * © Michaël Dzjaparidze 2018
 * https://github.com/michaeldzjap
 *
 * Playlist functionality for waveplayer.js
 *
 * This work is licensed under the ISC License (ISC)
 */

import Mediator from './Mediator.js';
import WavePlayer from './WavePlayer.js';
import {stateResolver, isObject} from './lib/index.js';

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
     * The URL's pointing to the audio files that make up the playlist.
     *
     * @var {Array}
     */
    _urls;

    /**
     * The HTML audio element associated with a waveplayer instance.
     *
     * @var {audio}
     */
    _audioElm;

    /**
     * The index of the current track that is selected in the playlist.
     *
     * @var {Number}
     */
    _currentTrackIndex;

    /**
     * Indicates if the user skipped to a different track in the playlist.
     *
     * @var {boolean}
     */
    _skipped = false;

    /**
     * Initialize a new playlist instance.
     *
     * @param  {Object} wavePlayer
     * @param  {Array} urls
     * @param  {Object} options
     * @returns {void}
     */
    constructor(wavePlayer, urls, options = {}) {
        if (!urls || !(urls instanceof Array)) {
            throw new TypeError('Argument \'urls\' is invalid.');
        }

        if (urls.length === 0) {
            throw new Error(
                'Argument \'urls\' needs to contain at least 1 item.'
            );
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
        this._urls = urls;
        this._audioElm = this._wavePlayer._audioElm;
        this._scheduler = this._createScheduler(urls, this._options.autoplay);
    }

    /**
     * Go to the next track in the playlist.
     *
     * @returns {void}
     */
    next() {
        if (this._currentTrackIndex < this._urls.length) {
            this._skipped = true;
            this._audioElm.dispatchEvent(new Event('ended'));
        }
    }

    /**
     * Go to the previous track in the playlist.
     *
     * @returns {void}
     */
    previous() {
        if (this._currentTrackIndex > 0) {
            this._currentTrackIndex -= 2;
            this._skipped = true;
            this._audioElm.dispatchEvent(new Event('ended'));
        }
    }

    /**
     * Skip to a specific track in the playlist.
     *
     * @param  {number} trackNumber
     * @returns {void}
     */
    skipTo(trackNumber) {
        const trackIndex = trackNumber - 1;
        if (trackIndex !== this._currentTrackIndex
            && trackIndex < this._urls.length && trackIndex >= 0) {
            this._currentTrackIndex = trackIndex - 1;
            this._skipped = true;
            this._audioElm.dispatchEvent(new Event('ended'));
        }
    }

    /**
     * Destroy the playlist instance and do the appropriate clean up.
     *
     * @returns {void}
     */
    destroy() {
        this._wavePlayer.pause();
        this._scheduler = null;
    }

    /**
     * Create a new scheduler for the playlist instance.
     *
     * @param  {Array} urls
     * @param  {boolean} autoPlay
     * @returns {Promise}
     */
    _createScheduler(urls, autoPlay) {
        this._currentTrackIndex = 0;
        const scheduler = stateResolver((function *(urls, me) { // eslint-disable-line
            while (me._currentTrackIndex < urls.length) {
                const {url, data} = isObject(urls[me._currentTrackIndex])
                    ? urls[me._currentTrackIndex]
                    : {url: urls[me._currentTrackIndex], data: null};

                yield me._wavePlayer.load(url, data);

                if (me._currentTrackIndex > 0) {
                    WavePlayer._mediator.fire(
                        'waveplayer:playlist:next',
                        me._wavePlayer,
                        {
                            url: urls[me._currentTrackIndex],
                            trackNumber: me._currentTrackIndex + 1
                        }
                    );
                    me._wavePlayer.play();
                } else {
                    WavePlayer._mediator
                        .fire('waveplayer:playlist:ready', me._wavePlayer);
                    if (autoPlay || me._skipped) me._wavePlayer.play();
                }

                // Wait until the current track finishes playing
                yield me._onEnd();
                me._currentTrackIndex++;
            }

            return me._currentTrackIndex;
        }));

        scheduler(urls, this).then(
            response => {
                this._skipped = false;
                WavePlayer._mediator
                    .fire(
                        'waveplayer:playlist:finished',
                        this._wavePlayer,
                        response
                    );
            }
        );

        return scheduler;
    }

    /**
    * Return a promise that resolves itself when the HTML audio element fires an
    * 'ended' event (i.e. when an audio track finished playing).
    *
    * @returns {Promise}
    */
    _onEnd() {
        return new Promise(resolve => {
            if (this._ended) {
                this._audioElm.removeEventListener('ended', this._ended);
            }
            this._ended = () => resolve('ended');
            this._audioElm.addEventListener('ended', this._ended.bind(this));
        });
    }

}

export default Playlist;
