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
import { stateResolver, getJSON } from './lib';

class WavePlayer {

    /**
     * The mediator singleton that will be used to listen to events and fire actions
     * in response.
     *
     * @var {object}
     */
    static _mediator;

    /**
     * The waveview instance associated with this waveplayer instance.
     *
     * @var {object}
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
     * @var {object}
     */
    _scheduler;

    /**
     * Initialize a new waveplayer instance.
     *
     * @param {object} options
     * @return {void}
     */
    constructor(options) {
        // Create a new mediator if there does not exist one yet
        if (!WavePlayer._mediator) {
            WavePlayer._mediator = new Mediator();
        }

        this._waveView = new WaveView(null, {...options, mediator: WavePlayer._mediator});

        Promise.all([
            this._initializeAudioElm(),
            this._initializeWaveViewInteraction()
        ]);
    }

    /************************
     * Getters and setters. *
     ************************/

    /**
     * Get the current volume of the audio.
     *
     * @return {number}
     */
    get volume() {
        return this._audioElm.volume;
    }

    /**
     * Set the current volume of the audio.
     *
     * @param {number} value
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
     * @param {string} url
     * @return {promise}
     */
    load(url) {
        return Promise.all([
            Promise.resolve(() => {
                this._audioElm.src = url;
                this._audioElm.load();
            }),
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
     * @param {number} seconds
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
     * @param {string} topic
     * @param {function} fn
     * @return {void}
     */
    on(topic, fn) {
        WavePlayer._mediator.on(topic, fn);
    }

    /**
     * Unsubscibe from a waveplayer.js event.
     *
     * @param {string} topic
     * @param {function} fn
     * @return {void}
     */
    un(topic, fn) {
        WavePlayer._mediator.un(topic, fn);
    }

    /**
     * Schedule a playlist.
     *
     * @param {object} options
     */
    schedulePlaylist(options) {
        const me = this;

        // cancel current playlist before starting a new one
        this.cancelPlaylist();

        this._scheduler = stateResolver(function* (urls) {
            try {
                for (let i = 0; i < urls.length; i++) {
                    yield me.load(urls[i]);
                    if (i > 0) {
                        me.play();
                    } else {
                        WavePlayer._mediator.fire('waveplayer:playlist:queued');
                        if (options.onStart) {
                            options.onStart.call(null);
                        }
                        // Wait until the current track finishes playing
                        yield me._onEnd();
                        if (options.onChange) {
                            options.onChange.call(null);
                        }
                    }
                }
                return 'waveplayer:playlist:ended';
            } catch (err) {
                console.error(err);
            }
        });

        this._scheduler(options.urls).then(
            (response) => {
                WavePlayer._mediator.fire(response);
                if (options.onEnd) {
                    options.onEnd.call(null, response);
                }
            },
            (err) => {
                console.error(err);
            }
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
     * @return {promise}
     */
    _initializeWaveViewInteraction() {
        return Promise.resolve(() => {
            if (this._onClickHandler) {
                WavePlayer._mediator.un('waveview:clicked', this._onClickHandler);
            }

            // The 'waveview:clicked' event passes along a number in the range [0-1]
            // that indicates the position of the click relative to the starting point
            // of the waveform
            this._onClickHandler = progress => {
                if (!this.isPlaying()) {    // Start playback from beginning if nothing is playing currently
                    this.play();
                    WavePlayer._mediator.fire('waveplayer:start-playback');
                } else {    // Skip to new position in audio file if we are currently playing something
                    this.skipTo(this._progressToDuration(progress));
                    WavePlayer._mediator.fire('waveplayer:skip-playback');
                }
            };
            WavePlayer._mediator.on('waveview:clicked', this._onClickHandler.bind(this));
        });
    }

    /**
     * Create and initialize the HTML audio element associated with this waveplayer
     * instance.
     *
     * @return {promise}
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
     * @param {string} url
     * @return {promise}
     */
    _getWaveformData(url) {
        return new Promise((resolve, reject) => {
            getJSON(url.substr(0, url.lastIndexOf('.')) + '.json')
                .then((response) => {
                    if (typeof response === 'object') {
                        this._waveView.drawWave(response[Object.keys(response)[0]], 0);
                    } else {
                        this._waveView.drawWave(response, 0);
                    }
                    resolve('waveplayer:json:fetched');
                })
                .catch(function(err) {
                    reject(err);
                });
        });
    }

    /**
     * Convert a duration in seconds to a progress in the range [0-1].
     *
     * @param {number} time
     * @return {number}
     */
    _durationToProgress(time) {
        return time / this.audioElm.duration;
    }

    /**
     * Convert a progress in the range [0-1] to a time in seconds.
     *
     * @param {number} progress
     * @return {number}
     */
    _progressToDuration(progress) {
        return progress * this.audioElm.duration;
    }

    /**
     * Return a promise that resolves itself when the HTML audio element fires an
     * 'ended' event (i.e. when an audio track finished playing).
     *
     * @return {promise}
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
