/**
 * waveplayer.js
 *
 * © Michaël Dzjaparidze 2015
 * http://www.michaeldzjaparidze.com, https://github.com/michaeldzjap
 *
 * A HTML5 based audio player with a waveform view
 *
 * This work is licensed under the ISC License (ISC)
 */

import Mediator from './Mediator.js';
import WaveView from './WaveView.js';
import { stateResolver, getJSON } from './lib/index.js';

class WavePlayer {

    /**
     * The mediator singleton that will be used to listen to events and fire actions
     * in response.
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
     * The scheduler instance used for handling a playlist.
     *
     * @var {Object}
     */
    _scheduler;

    /**
     * Initialize a new waveplayer instance.
     *
     * @param {Object} options
     * @return {void}
     */
    constructor(options) {
        // Create a new mediator if there does not exist one yet
        if (!WavePlayer._mediator) {
            WavePlayer._mediator = new Mediator;
        }

        this._waveView = new WaveView(null, {...options});

        Promise.all([
            this._initializeAudioElm(),
            this._initializeWaveViewInteraction()
        ]).then(() => WavePlayer._mediator.fire('waveplayer:initialized'));
    }

    /************************
     * Getters and setters. *
     ************************/

    /**
     * Get the current volume of the audio.
     *
     * @return {Number}
     */
    get volume() {
        return this._audioElm.volume;
    }

    /**
     * Set the current volume of the audio.
     *
     * @param {Number} value
     * @return {void}
     */
    set volume(value) {
        this._audioElm.volume = value;
    }

    /**
     * Check if we can currently interact with the assocated waveview instance.
     *
     * @return {boolean}
     */
    get interact() {
        return this._waveView.interact;
    }

    /**
     * Set the interaction state of the associated waveview instance.
     *
     * @param {boolean} value
     * @return {void}
     */
    set interact(value) {
        this._waveView.interact = value;
    }

    /**
     * Check if the associated waveview instance is operating in responsive mode.
     *
     * @return {boolean}
     */
    get responsive() {
        return this._waveView.responsive;
    }

    /**
     * Make the associated waveview instance responsive, meaning its width will
     * scale along with the width of its parent container.
     *
     * @param {boolean} value
     * @return {void}
     */
    set responsive(value) {
        this._waveView.responsive = value;
    }

    /*********************
     * Public functions. *
     *********************/

    /**
     * Load a track and return a promise which may be used to perform an action
     * when the track has finished loading.
     *
     * @param {String} url
     * @return {Promise}
     */
    load(url) {
        return Promise.all([
            Promise.resolve((() => {
                this._audioElm.src = url;
                this._audioElm.load();
                console.log(1);
            })()),
            this._getWaveformData(url)
        ]);
    }

    /**
     * Start audio playback.
     *
     * @return {void}
     */
    play() {
        this._audioElm.play();
    }

    /**
     * Pause audio playback.
     *
     * @return {void}
     */
    pause() {
        this._audioElm.pause();
    }

    /**
     * Move the playback header to a specific time in the audio file.
     *
     * @param {Number} seconds
     * @return {void}
     */
    skipTo(seconds) {
        this._audioElm.currentTime = seconds;
    }

    /**
     * Check if audio is currently playing.
     *
     * @return {boolean}
     */
    isPlaying() {
        return this._audioElm.paused ? false : true;
    }

    /**
     * Subscribe to a waveplayer.js event.
     *
     * @param {String} topic
     * @param {Function} fn
     * @return {void}
     */
    on(topic, fn) {
        WavePlayer._mediator.on(topic, fn);
    }

    /**
     * Unsubscibe from a waveplayer.js event.
     *
     * @param {String} topic
     * @param {Function} fn
     * @return {void}
     */
    un(topic, fn) {
        WavePlayer._mediator.un(topic, fn);
    }

    /**
     * Schedule a playlist.
     *
     * @param {Array} urls
     * @return {void}
     */
    schedulePlaylist(urls) {
        if (!urls || !(urls instanceof Array)) {
            throw new TypeError('Argument \'urls\' is invalid.');
        }

        if (urls.length === 0) {
            throw new Error('Argument \'urls\' needs to contain at least 1 item.');
        }

        // cancel current playlist before starting a new one
        this.cancelPlaylist();

        this._scheduler = stateResolver((function* (urls) {
            try {
                let i = 0;
                for (i = 0; i < urls.length; i++) {
                    yield this.load(urls[i]);
                    console.log(3);
                    if (i > 0) {
                        WavePlayer._mediator.fire('waveplayer:playlist:next', this, {url: urls[i], trackNumber: i + 1});
                        this.play();
                    } else {
                        WavePlayer._mediator.fire('waveplayer:playlist:ready', this);
                    }
                    // Wait until the current track finishes playing
                    yield this._onEnd();
                }

                return i;
            } catch (err) {
                // console.error(err);
            }
        })).bind(this);

        this._scheduler(urls).then(
            response => WavePlayer._mediator.fire('waveplayer:playlist:finished', response),
            err => console.log(err)
        );
    }

    /**
     * Cancel a playlist.
     *
     * @return {void}
     */
    cancelPlaylist() {
        if (this._scheduler) {
            this._scheduler = null;
        }
    }

    /**
     * Destroy the waveplayer instance and do the appropriate clean up.
     *
     * @return {void}
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
            this._audioElm.parentNode && this._audioElm.parentNode.removeChild(this._audioElm);
            this._audioElm = null;
        }
        this._waveView.destroy();
    }

    /**********************
     * Private functions. *
     **********************/

    /**
     * Initialize the interaction with the associated waveview instance by attaching
     * a click handler to the 'waveview:clicked' event.
     *
     * @return {Promise}
     */
    _initializeWaveViewInteraction() {
        return Promise.resolve((() => {
            if (this._onClickHandler) {
                WavePlayer._mediator.un('waveview:clicked', this._onClickHandler);
            }

            // The 'waveview:clicked' event passes along a number in the range [0-1]
            // that indicates the position of the click relative to the starting point
            // of the waveform
            this._onClickHandler = progress => {
                if (this.isPlaying()) {
                    // Skip to new position in audio file if we are currently playing something
                    const time = this._progressToDuration(progress);
                    this.skipTo(time);
                    WavePlayer._mediator.fire('waveplayer:skipped', this, time);
                }
            };
            WavePlayer._mediator.on('waveview:clicked', this._onClickHandler.bind(this));
        })());
    }

    /**
     * Create and initialize the HTML audio element associated with this waveplayer
     * instance.
     *
     * @return {Promise}
     */
    _initializeAudioElm() {
        return new Promise((resolve, reject) => {
            if (this._waveView.container.querySelector('audio')) {
                this._audioElm.removeEventListener('canplay', this._canplayHandler);
                this._audioElm.removeEventListener('error', this._errorHandler);
                this._audioElm.removeEventListener('timeupdate', this._timeUpdateHandler);
                this._waveView.container.removeChild(this._audioElm);
            }

            // Create a new audio element and attach listeners
            this._audioElm = this._createAudioElm();
            this._waveView.container.appendChild(this._audioElm);

            this._canplayHandler = () => {
                WavePlayer._mediator.fire('waveplayer:canplay');
                resolve('waveplayer:canplay');
            };
            this._audioElm.addEventListener('canplay', this._canplayHandler.bind(this));

            this._errorHandler = e => {
                switch (e.target.error.code) {
                    case e.target.error.MEDIA_ERR_ABORTED:
                        reject(new Error('Fetching process aborted by user'));
                        break;
                    case e.target.error.MEDIA_ERR_NETWORK:
                        reject(new Error('There was a problem downloading the audio file'));
                        break;
                    case e.target.error.MEDIA_ERR_DECODE:
                        reject(new Error('There was a problem decoding the audio file'));
                        break;
                    case e.target.error.MEDIA_ERR_SRC_NOT_SUPPORTED:
                        reject(new Error('Audio is not supported, check the provided URL'));
                        break;
                    default:
                        reject(new Error('An unknown error occurred'));
                }
            };
            this._audioElm.addEventListener('error', this._errorHandler.bind(this));

            this._timeUpdateHandler = e => this._waveView.updateWave(this._durationToProgress(e.target.currentTime));
            this._audioElm.addEventListener('timeupdate', this._timeUpdateHandler.bind(this));
        });
    }

    /**
     * Create a new HTML audio element.
     *
     * @return {audio}
     */
    _createAudioElm() {
        const audioElm = document.createElement('audio');
        audioElm.controls = false;
        audioElm.autoplay = false;
        audioElm.preload = 'auto';

        return audioElm;
    }

    /**
     * Get the waveform data for an audio file.
     *
     * @param {String} url
     * @return {Promise}
     */
    _getWaveformData(url) {
        return new Promise((resolve, reject) => {
            getJSON(url.substr(0, url.lastIndexOf('.')) + '.json')
                .then(response => {
                    if (typeof response === 'object') {
                        this._waveView.drawWave(response[Object.keys(response)[0]], 0);
                    } else {
                        this._waveView.drawWave(response, 0);
                    }
                    console.log(2);
                    resolve('waveplayer:json:fetched');
                })
                .catch(err => reject(err));
        });
    }

    /**
     * Convert a duration in seconds to a progress in the range [0-1].
     *
     * @param {number} time
     * @return {number}
     */
    _durationToProgress(time) {
        return time / this._audioElm.duration;
    }

    /**
     * Convert a progress in the range [0-1] to a time in seconds.
     *
     * @param {Number} progress
     * @return {Number}
     */
    _progressToDuration(progress) {
        return progress * this._audioElm.duration;
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

export default WavePlayer;
