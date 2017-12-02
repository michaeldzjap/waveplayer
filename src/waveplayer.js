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

import WaveView from './WaveView.js';

class WavePlayer {

    /**
     * The options for this waveplayer instance.
     *
     * @var {object}
     */
    _options;

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
     * Initialize a new waveplayer instance.
     *
     * @param {object} options
     * @return {void}
     */
    constructor(options) {
        this._options = {...options};
        this._waveView = new WaveView(options);

        Promise.all([
            this.__initializeAudioElm(),
            this._initializeWaveViewInteraction()
        ]);
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

    /**********************
     * Private functions. *
     **********************/

    /**
     * Initialize the ineraction with the associated waveview instance by attaching
     * a click handler to the 'waveview:clicked' event.
     *
     * @return {void}
     */
    _initializeWaveViewInteraction() {
        return Promise.resolve(() => {
            if (this._onClickHandler) {
                this._mediator.un('waveview:clicked', this._onClickHandler);
            }

            // The 'waveview:clicked' event passes along a number in the range [0-1]
            // that indicates the position of the click relative to the starting point
            // of the waveform
            this._onClickHandler = progress => {
                if (!this.isPlaying()) {    // Start playback from beginning if nothing is playing currently
                    this.play();
                    this._mediator.fire('waveplayer:start-playback');
                } else {    // Skip to new position in audio file if we are currently playing something
                    this.skipToSec(progress * this.audioElm.duration);
                    this._mediator.fire('waveplayer:skip-playback');
                }
            };
            this._mediator.on('waveview:clicked', this._onClickHandler.bind(this));
        });
    }

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
                this._mediator.fire('canplay');
                resolve('canplay');
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

            this._timeUpdateHandler = e => this._waveView.updateWave(this._duration2Progress(e.target.currentTime));
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

}

export default WavePlayer;
