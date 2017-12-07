/**
 * waveview.js
 *
 * © Michaël Dzjaparidze 2015
 * http://www.michaeldzjaparidze.com, https://github.com/michaeldzjap
 *
 * Draws a waveform using the HTML5 canvas object
 *
 * This work is licensed under the ISC License (ISC)
 */

import { style, hex2rgb, rgb2hsv, hsv2rgb } from './lib';

class WaveView {

    /**
     * The default options for a new instance.
     *
     * @var {object}
     */
    _defaultOptions = {
        container: null,
        height: 128,
        waveColor: '#428bca',
        progressColor: '#31708f',
        barWidth: 4,
        barGap: 1,
        interact: true,
        responsive: true,
        progress: 0
    };

    /**
     * The amplitude data that will be used to draw the waveform.
     *
     * @var {array}
     */
    _data;

    /**
     * The options for this waveplayer instance.
     *
     * @var {object}
     */
    _options;

    /**
     * The HTML container element for the waveview instance.
     *
     * @var {object}
     */
    _container;

    /**
     * The HTML container element for the canvas element.
     *
     * @var {object}
     */
    _waveContainer;

    /**
     * The HTML canvas element context.
     *
     * @var {object}
     */
    _canvasContext;

    /**
     * The color variations that will be used for drawing the waveform.
     *
     * @var {object};
     */
    _colors;

    /**
     * Initialize a new waveview instance.
     *
     * @param {array} data
     * @param {object} options
     * @return {void}
     */
    constructor(data, options) {
        this._data = data;
        this._options = {...options};

        this.container = 'string' === typeof this._options.container ?
            document.querySelector(this._options.container) : this._options.container;

        this._createWaveContainer();
        this._colors = this._createColorVariations();
        this._initializeResizeHandler();
    }

    /************************
     * Getters and setters. *
     ************************/

    /**
     * Get the HTML container element for the waveview instance.
     *
     * @return {object}
     */
    get container() {
        return this._container;
    }

    /**
     * Set the HTML container element for the waveview instance.
     *
     * @param {object} container
     * @return {void}
     */
    set container(container) {
        if (!container) {
            throw new Error('Please supply a valid container element');
        }

        this._container = container;
    }

    /**
     * Get the waveform amplitude data.
     *
     * @return {array}
     */
    get data() {
        return this._data;
    }

    /**
     * Set the waveform amplitude data.
     *
     * @param {array} values
     * @return {void}
     */
    set data(values) {
        this._data = values;
    }

    /**
     * Check if we can currently interact with the waveview instance.
     *
     * @return {boolean}
     */
    get interact() {
        return this._options.interact;
    }

    /**
     * Set the interaction state of the waveview instance.
     *
     * @param {boolean} value
     * @return {void}
     */
    set interact(value) {
        this._options.interact = value;
        if (value) {
            this._addCanvasHandlers();
        } else {
            this._removeCanvasHandlers();
        }
    }

    /**
     * Check if the waveview instance is operating in responsive mode.
     *
     * @return {boolean}
     */
    get responsive() {
        return this._options.responsive;
    }

    /**
     * Make the waveview instance responsive, meaning its width will scale along
     * with the width of its parent container.
     *
     * @param {boolean} value
     * @return {void}
     */
    set responsive(value) {
        this._options.responsive = value;
        this._initializeResizeHandler();
    }

    /**********************
     * Private functions. *
     **********************/

    /**
     * Create the HTML container element for the HTML canvas element in which we
     * will draw the waveform.
     *
     * @return {void}
     */
    _createWaveContainer() {
        this._waveContainer = document.createElement('div');
        this._waveContainer.className = 'waveform-container';
        this._container.appendChild(this._waveContainer);
        this.style(this._waveContainer, {
            display: 'block',
            position: 'relative',
            width: '100%',
            height: this._options.height + 'px',
            overflow: 'hidden'
        });
        this._createCanvas();
    }

    /**
     * Create the HTML canvas element in which we will draw the waveform.
     *
     * @return {void}
     */
    _createCanvas() {
        const clientWidth = this._waveContainer.clientWidth;
        const canvas = this._waveContainer.appendChild(
            style(document.createElement('canvas'), {
                position: 'absolute',
                top: 0,
                bottom: 0,
                zIndex: 1,
                height: this._options.height + 'px',
                width: clientWidth + 'px'   // for responsive, enough to set this to 100% ???
            })
        );
        this._canvasContext = canvas.getContext('2d');
        this._canvasContext.canvas.width = clientWidth;
        this._canvasContext.canvas.height = this._options.height;
        if (this._options.interact) {
            this._addCanvasHandlers();
        }
    }

    /**
     * Add a canvas click handler.
     *
     * @return {void}
     */
    _addCanvasHandlers() {
        this._mouseClickHandler = e => this._mediator.fire('waveview:clicked', this._coord2Progress(e));
        this._canvasContext.canvas.addEventListener('click', this._mouseClickHandler.bind(this));
    }

    /**
     * Remove the canvas click handler.
     *
     * @return {void}
     */
    _removeCanvasHandlers() {
        if (this._mouseClickHandler) {
            this.canvasContect.canvas.removeEventListener('click', this._mouseClickHandler);
        }
    }

    /**
     * Create a color stop variation for the colors provided (used for drawing
     * the gradient).
     *
     * @return {object}
     */
    _createColorVariations() {
        const colors = {waveColor: [], progressColor: []};

        for (const c in colors) {
            let tmp = hex2rgb(this._options[c]);
            colors[c].push(tmp);
            tmp = rgb2hsv(tmp);
            colors[c].push(hsv2rgb({ h: tmp.h, s: tmp.s, v: tmp.v * 1.4 }));
        }

        colors.dc = {
            r: (colors.waveColor[0].r - colors.progressColor[0].r),
            g: (colors.waveColor[0].g - colors.progressColor[0].g),
            b: (colors.waveColor[0].b - colors.progressColor[0].b)
        };

        return colors;
    }

    /**
     * Initialize the resize handler for the waveview. If the waveview instance
     * is not in responsive mode we do nothing on a resize event, meaning the wave
     * will not be redrawn. If we are in responsive mode the width of the canvas
     * is rescaled and hence the waveform needs to be redrawn after this.
     *
     * @return {void}
     */
    _initializeResizeHandler() {
        if (!this._options.responsive) {
            if (this._resizeHandler) {
                window.removeEventListener('resize', this._resizeHandler);
            }

            return;
        }

        if (this._resizeHandler) {
            window.removeEventListener('resize', this._resizeHandler);
        }

        this._resizeHandler = () => {
            const width = this._waveContainer.clientWidth;
            style(this._canvasContext.canvas, {width: width + 'px'});
            this._canvasContext.canvas.width = width;
            this._barData = this._calcAvgAmps();
            this.updateWave(this._progress);
        };
        window.addEventListener('resize', this._resizeHandler);
    }

    /**
     * Compute average absolute waveform amplitudes.
     *
     * @return {object}
     */
    _calcAvgAmps() {
        // Compute amplitude by averaging over n values in the range [rangeL, rangeR]
        const avgAmp = (dataIndex, rangeL, rangeR, n) => {
            let sum = 0.0;
            for (let i = rangeL; i <= rangeR; i++) {
                sum += Math.abs(this._data[dataIndex + i]);
            }

            return sum / n;
        };

        const totalWidth = this._waveContainer.clientWidth;
        const ratio = totalWidth !== this._data.length ? this._data.length / totalWidth : 1;
        const totalBarWidth = this._options.barWidth + this._options.barGap;
        let rangeR = (totalBarWidth - 1) / 2;
        const rangeL = -~~rangeR;
        const incr = totalBarWidth * ratio;
        const bd = {amps: [], x: []};
        rangeR = Math.round(rangeR);

        bd.amps.push(avgAmp(0, 0, rangeR, totalBarWidth));
        bd.x.push(0);
        var i, j;
        for (i = totalBarWidth, j = incr; j + rangeR < this._data.length; i += totalBarWidth, j += incr) {
            bd.amps.push(avgAmp(~~j, rangeL, rangeR, totalBarWidth));
            bd.x.push(i);
        }

        // See if we can squeeze in one more bar
        j = ~~j;
        rangeR = -(j - this._data.length + 1);
        if (i <= totalWidth - totalBarWidth && rangeR > rangeL) {
            bd.amps.push(avgAmp(j, rangeL, rangeR, rangeR - rangeL));
            bd.x.push(i);
        }

        bd.norm = 1 / Math.max.apply(Math, bd.amps);

        return bd;
    }

}

export default WaveView;
