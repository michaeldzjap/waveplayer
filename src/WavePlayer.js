/**
 * WavePlayer.js
 *
 * © Michaël Dzjaparidze 2018
 * https://github.com/michaeldzjap
 *
 * A HTML5 based audio player with a waveform view
 *
 * This work is licensed under the ISC License (ISC)
 */

import Mediator from './Mediator.js';
import WaveView from './WaveView.js';
import Playlist from './Playlist.js';
import {getJSON, isString, isObject} from './lib/index.js';

class WavePlayer {

    /**
     * The default options for a new instance.
     *
     * @var {Object}
     */
    _defaultOptions = {
        preload: 'metadata'
    };

    /**
     * The options for this waveplayer instance.
     *
     * @var {Object}
     */
    _options;

    /**
     * The mediator singleton that will be used to listen to events and fire
     * actions in response.
     *
     * @var {Object}
     */
    static _mediator;

    /**
     * The waveview instance associated with this waveplayer instance.
     *
     * @var {Object}
     */
    _waveView;

    /**
     * The HTML audio element associated with this waveplayer instance.
     *
     * @var {audio}
     */
    _audioElm;

    /**
     * The playlist instance.
     *
     * @var {Playlist}
     */
    _playlist;

    /**
     * The position of the playback header relative to the duration of the
     * currently playing track
     *
     * @var {number}
     */
    _currentTime;

    /**
     * The waveform amplitude data.
     */

    /**
     * Initialize a new waveplayer instance.
     *
     * @param  {Object} options
     * @returns {void}
     */
    constructor(options) {
        // Create a new mediator if there does not exist one yet
        if (!WavePlayer._mediator) WavePlayer._mediator = new Mediator;

        this._options = {...this._defaultOptions, ...options};
        this._waveView = new WaveView(null, {...this._options});

        Promise.all([
            this._initializeAudioElm(),
            this._initializeWaveViewInteraction()
        ])
            .then(() => (
                WavePlayer._mediator.fire('waveplayer:initialized', this)
            ));
    }

    /************************
     * Getters and setters. *
     ************************/

    /**
     * Get the current volume of the currently loaded / playing track.
     *
     * @returns {number}
     */
    get volume() {
        return this._audioElm.volume;
    }

    /**
     * Set the current volume of the currently loaded / playing track.
     *
     * @param  {number} value
     * @returns {void}
     */
    set volume(value) {
        this._audioElm.volume = value;
    }

    /**
     * Check if we can currently interact with the assocated waveview instance.
     *
     * @returns {boolean}
     */
    get interact() {
        return this._waveView.interact;
    }

    /**
     * Set the interaction state of the associated waveview instance.
     *
     * @param  {boolean} value
     * @returns {void}
     */
    set interact(value) {
        this._waveView.interact = value;
    }

    /**
     * Check if the associated waveview instance is operating in responsive
     * mode.
     *
     * @returns {boolean}
     */
    get responsive() {
        return this._waveView.responsive;
    }

    /**
     * Make the associated waveview instance responsive, meaning its width will
     * scale along with the width of its parent container.
     *
     * @param  {boolean} value
     * @returns {void}
     */
    set responsive(value) {
        this._waveView.responsive = value;
    }

    /**
     * Get the playlist instance associated with this waveplayer instance.
     *
     * @returns {null|Playlist}
     */
    get playlist() {
        if (this._playlist) {
            return this._playlist;
        }

        return null;
    }

    /**
     * Get the position of the playback header relative to the duration of the
     * currently loaded / playing track.
     *
     * @returns {number}
     */
    get currentTime() {
        return this._currentTime;
    }

    /**
     * Get the duration of the currently loaded / playing track.
     *
     * @returns {number}
     */
    get duration() {
        return this._audioElm.duration;
    }

    /*********************
     * Public functions. *
     *********************/

    /**
     * Load an audio file and return a promise which may be used to perform an
     * action when the audio has finished loading.
     *
     * @param  {string} url
     * @param  {Object|Array|null} data
     * @returns {Promise}
     */
    load(url, data = null) {
        return Promise.all([
            this.loadAudio(url),
            this.loadWaveform(data || this._jsonUrl(url)),
        ]);
    }

    /**
     * Load the audio from the given URL.
     *
     * @param  {string} url
     * @returns {Promise}
     */
    loadAudio(url) {
        return new Promise(resolve => {
            this._audioElm.src = url;
            this._audioElm.load();
            this._currentTime = 0;
            WavePlayer._mediator.on('waveplayer:canplay', () => resolve());
        });
    }

    /**
     * Load the waveform data from a given URL to a JSON file or explicitly
     * provided waveform data.
     *
     * @param  {string|Object|Array} data
     * @returns {Promise}
     */
    loadWaveform(data) {
        if (isString(data)) {
            // If the data is a URL, fetch the data before drawing
            return this._getWaveformData(data);
        }

        // Otherwise just draw the wave using the given data
        return Promise.resolve(this._waveView.drawWave(
            isObject(data) ? [...data[Object.keys(data)[0]]] : [...data],
            0
        ));
    }

    /**
     * Start audio playback.
     *
     * @returns {void}
     */
    play() {
        this._audioElm.play();
    }

    /**
     * Pause audio playback.
     *
     * @returns {void}
     */
    pause() {
        this._audioElm.pause();
    }

    /**
     * Move the playback header to a specific time in the audio file.
     *
     * @param  {number} seconds
     * @returns {void}
     */
    skipTo(seconds) {
        this._audioElm.currentTime = seconds;
    }

    /**
     * Check if audio is currently playing.
     *
     * @returns {boolean}
     */
    isPlaying() {
        return !this._audioElm.paused;
    }

    /**
     * Subscribe to a waveplayer.js event.
     *
     * @param  {string} topic
     * @param  {Function} fn
     * @returns {void}
     */
    on(topic, fn) {
        WavePlayer._mediator.on(topic, fn);
    }

    /**
     * Unsubscibe from a waveplayer.js event.
     *
     * @param  {string} topic
     * @param  {Function} fn
     * @returns {void}
     */
    un(topic, fn) {
        WavePlayer._mediator.un(topic, fn);
    }

    /**
     * Create a new playlist.
     *
     * @param  {Array} urls
     * @param  {Object} options
     * @returns {Playlist}
     */
    createPlaylist(urls, options = {}) {
        // Cancel current playlist before starting a new one
        this.cancelPlaylist();
        this._playlist = new Playlist(this, urls, options);

        return this._playlist;
    }

    /**
     * Cancel a playlist.
     *
     * @returns {void}
     */
    cancelPlaylist() {
        if (this._playlist) {
            this._playlist.destroy();
        }
    }

    /**
     * Destroy the waveplayer instance and do the appropriate clean up.
     *
     * @returns {void}
     */
    destroy() {
        this.pause();
        this.cancelPlaylist();
        WavePlayer._mediator.unAll();
        if (this._audioElm) {
            this._audioElm.removeEventListener('canplay', this._canplayHandler);
            this._audioElm.removeEventListener('error', this._errorHandler);
            this._audioElm.removeEventListener('timeupdate', this._timeUpdateHandler);
            if (this._ended) {
                this._audioElm.removeEventListener('ended', this._ended);
            }
            this._audioElm.parentNode
                && this._audioElm.parentNode.removeChild(this._audioElm);
            this._audioElm = null;
        }
        this._waveView.destroy();
    }

    /**********************
     * Private functions. *
     **********************/

    /**
     * Initialize the interaction with the associated waveview instance by
     * attaching a click handler to the 'waveview:clicked' event.
     *
     * @returns {Promise}
     */
    _initializeWaveViewInteraction() {
        return Promise.resolve((() => {
            if (this._onClickHandler) {
                WavePlayer._mediator.un('waveview:clicked', this._onClickHandler);
            }

            // The 'waveview:clicked' event passes along a number in the range
            // [0-1] that indicates the position of the click relative to the
            // starting point of the waveform
            this._onClickHandler = progress => {
                if (this.isPlaying()) {
                    // Skip to new position in audio file if we are currently
                    // playing something
                    const time = this._progressToDuration(progress);
                    this.skipTo(time);
                    WavePlayer._mediator.fire('waveplayer:skipped', this, time);
                }
            };
            WavePlayer._mediator.on(
                'waveview:clicked',
                this._onClickHandler.bind(this)
            );
        })());
    }

    /**
     * Create and initialize the HTML audio element associated with this
     * waveplayer instance.
     *
     * @returns {Promise}
     */
    _initializeAudioElm() {
        return new Promise((resolve, reject) => {
            if (this._waveView.container.querySelector('audio')) {
                this._audioElm.removeEventListener(
                    'canplay',
                    this._canplayHandler
                );
                this._audioElm.removeEventListener('error', this._errorHandler);
                this._audioElm.removeEventListener(
                    'timeupdate',
                    this._timeUpdateHandler
                );
                this._waveView.container.removeChild(this._audioElm);
            }

            // Create a new audio element and attach listeners
            this._audioElm = this._createAudioElm();
            this._waveView.container.appendChild(this._audioElm);

            this._canplayHandler = () => {
                WavePlayer._mediator.fire('waveplayer:canplay', this);
                resolve('waveplayer:canplay');
            };
            this._audioElm.addEventListener(
                'canplay',
                this._canplayHandler.bind(this)
            );

            this._errorHandler = e => {
                switch (e.target.error.code) {
                    case e.target.error.MEDIA_ERR_ABORTED:
                        reject(new Error('Fetching process aborted by user'));
                        break;
                    case e.target.error.MEDIA_ERR_NETWORK:
                        reject(
                            new Error(
                                'There was a problem downloading the audio file'
                            )
                        );
                        break;
                    case e.target.error.MEDIA_ERR_DECODE:
                        reject(
                            new Error(
                                'There was a problem decoding the audio file'
                            )
                        );
                        break;
                    case e.target.error.MEDIA_ERR_SRC_NOT_SUPPORTED:
                        reject(
                            new Error(
                                'Audio is not supported, check the provided URL'
                            )
                        );
                        break;
                    default:
                        reject(new Error('An unknown error occurred'));
                }
            };
            this._audioElm.addEventListener('error', this._errorHandler.bind(this));

            this._timeUpdateHandler = e => {
                this._currentTime = e.target.currentTime;
                this._waveView
                    .updateWave(this._durationToProgress(this._currentTime));
            };
            this._audioElm.addEventListener(
                'timeupdate',
                this._timeUpdateHandler.bind(this)
            );
        });
    }

    /**
     * Create a new HTML audio element.
     *
     * @returns {audio}
     */
    _createAudioElm() {
        const audioElm = document.createElement('audio');
        audioElm.controls = false;
        audioElm.autoplay = false;
        audioElm.preload = this._options.preload;

        return audioElm;
    }

    /**
     * Get the waveform data for an audio file.
     *
     * @param  {string} url
     * @returns {Promise}
     */
    _getWaveformData(url) {
        return new Promise((resolve, reject) => {
            getJSON(url)
                .then(response => {
                    this._waveView.drawWave(
                        isObject(response)
                            ? response[Object.keys(response)[0]]
                            : response,
                        0
                    );
                    resolve('waveplayer:json:fetched');
                })
                .catch(err => reject(err));
        });
    }

    /**
     * Convert a duration in seconds to a progress in the range [0-1].
     *
     * @param  {number} time
     * @returns {number}
     */
    _durationToProgress(time) {
        return time / this._audioElm.duration;
    }

    /**
     * Convert a progress in the range [0-1] to a time in seconds.
     *
     * @param  {number} progress
     * @returns {number}
     */
    _progressToDuration(progress) {
        return progress * this._audioElm.duration;
    }

    /**
     * Use the given URL to an audio file to determine the correct URL to the
     * associated JSON file holding the waveform data.
     *
     * @param  {string} url
     * @returns {string}
     */
    _jsonUrl(url) {
        return `${url.substr(0, url.lastIndexOf('.'))}.json`;
    }

}

export default WavePlayer;
