/**
 * WaveView.js
 *
 * © Michaël Dzjaparidze 2018
 * https://github.com/michaeldzjap
 *
 * Draws a waveform using the HTML5 canvas object
 *
 * This work is licensed under the ISC License (ISC)
 */

import Mediator from './Mediator.js';
import WavePlayer from './WavePlayer.js';
import {style, hex2rgb, rgb2hsv, hsv2rgb} from './lib/index.js';

class WaveView {

    /**
     * The default options for a new instance.
     *
     * @var {Object}
     */
    _defaultOptions = {
        container: null,
        width: 512,
        height: 128,
        waveColor: '#428bca',
        progressColor: '#31708f',
        barWidth: 4,
        barGap: 1,
        interact: true,
        responsive: true,
        progress: 0,
        useGradient: true,
    };

    /**
     * The amplitude data that will be used to draw the waveform.
     *
     * @var {Array|null}
     */
    _data = null;

    /**
     * The options for this waveview instance.
     *
     * @var {Object}
     */
    _options;

    /**
     * The HTML container element for the waveview instance.
     *
     * @var {Object}
     */
    _container;

    /**
     * The HTML container element for the canvas element.
     *
     * @var {Object}
     */
    _waveContainer;

    /**
     * The HTML canvas element context.
     *
     * @var {Object}
     */
    _canvasContext;

    /**
     * The color variations that will be used for drawing the waveform.
     *
     * @var {Object};
     */
    _colors;

    /**
     * The progress in the range [0-1] of the waveform.
     *
     * @var {Number}
     */
    _progress = 0;

    /**
     * Initialize a new waveview instance.
     *
     * @param  {Array} data
     * @param  {Object} options
     * @returns {void}
     */
    constructor(data, options) {
        // Create a new mediator if there does not exist one yet
        if (!WavePlayer._mediator) {
            WavePlayer._mediator = new Mediator;
        }

        if (data) this.drawWave(data, 0);
        this._options = {...this._defaultOptions, ...options};
        this.container = 'string' === typeof this._options.container
            ? document.querySelector(this._options.container)
            : this._options.container;

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
     * @returns {Object}
     */
    get container() {
        return this._container;
    }

    /**
     * Set the HTML container element for the waveview instance.
     *
     * @param  {Object} container
     * @returns {void}
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
     * @returns {Array}
     */
    get data() {
        return this._data;
    }

    /**
     * Set the waveform amplitude data.
     *
     * @param  {Array} values
     * @returns {void}
     */
    set data(values) {
        this._data = values;
    }

    /**
     * Check if we can currently interact with the waveview instance.
     *
     * @returns {boolean}
     */
    get interact() {
        return this._options.interact;
    }

    /**
     * Set the interaction state of the waveview instance.
     *
     * @param  {boolean} value
     * @returns {void}
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
     * @returns {boolean}
     */
    get responsive() {
        return this._options.responsive;
    }

    /**
     * Make the waveview instance responsive, meaning its width will scale along
     * with the width of its parent container.
     *
     * @param  {boolean} value
     * @returns {void}
     */
    set responsive(value) {
        this._options.responsive = value;
        this._initializeResizeHandler();
    }

    /**
     * Get the width of the drawn waveform.
     *
     * @returns {number}
     */
    get width() {
        return this._waveContainer.clientWidth;
    }

    /**
     * Set the width of the drawn waveform. Only has an effect if the waveview
     * instance is not operating in responsive mode.
     *
     * @param  {number} value
     * @returns {void}
     */
    set width(value) {
        this._options.width = value;
        if (!this._options.responsive) {
            style(this._waveContainer, {width: `${this._options.width}px`});
            style(this._canvasContext.canvas, {width: `${this._options.width}px`});
            this._canvasContext.canvas.width = this._options.width;
            this._barData = this._calcAvgAmps();
        }
    }

    /**
     * Get the height of the drawn waveform.
     *
     * @returns {number}
     */
    get height() {
        return this._waveContainer.clientHeight;
    }

    /**
     * Set the height of the drawn waveform.
     *
     * @param  {number} value
     * @returns {void}
     */
    set height(value) {
        this._options.height = value;
        style(this._waveContainer, {height: `${this._options.height}px`});
        style(this.canvasContext.canvas, {height: `${this._options.height}px`});
        this._canvasContext.canvas.height = this._options.height;
        this._barData = this._calcAvgAmps();
    }

    /**
     * Get the flag for if the waveform is drawn with a gradient.
     *
     * @returns {boolean}
     */
    get useGradient() {
        return this._options.useGradient;
    }

    /**
     * Set the flag for if the waveform is drawn with a gradient.
     *
     * @param  {boolean} value
     * @returns {void}
     */
    set useGradient(value) {
        this._options.useGradient = value;
    }

    /*********************
     * Public functions. *
     *********************/

    /**
     * Draw a waveform from supplied waveform data.
     *
     * @param  {Array} values
     * @param  {number} progress
     * @returns {void}
     */
    drawWave(values, progress) {
        this._data = values;
        this._progress = progress;
        this._barData = this._calcAvgAmps();
        this.clearWave();
        this._drawBars(this._progress * this._waveContainer.clientWidth);
    }

    /**
     * Update an existing waveform.
     *
     * @param  {number} progress
     * @returns {void}
     */
    updateWave(progress) {
        if (progress) {
            this._progress = progress;
        }
        this.clearWave();
        this._drawBars(this._progress * this._waveContainer.clientWidth);
    }

    /**
     * Clear the canvas HTML element where the waveform is drawn in.
     *
     * @returns {void}
     */
    clearWave() {
        this._canvasContext
            .clearRect(
                0,
                0,
                this._canvasContext.canvas.width,
                this._canvasContext.canvas.height
            );
    }

    /**
     * Destroy the waveview instance and do the appropriate clean up.
     *
     * @returns {void}
     */
    destroy() {
        this._removeCanvasHandlers();
        if (this._resizeHandler) {
            window.removeEventListener('resize', this._resizeHandler);
        }
        WavePlayer._mediator.unAll();
        this._waveContainer && this._container.removeChild(this._waveContainer);
        this._waveContainer = null;
    }

    /**********************
     * Private functions. *
     **********************/

    /**
     * Create the HTML container element for the HTML canvas element in which we
     * will draw the waveform.
     *
     * @returns {void}
     */
    _createWaveContainer() {
        this._waveContainer = document.createElement('div');
        this._waveContainer.className = 'waveform-container';
        this._container.appendChild(this._waveContainer);
        style(this._waveContainer, {
            display: 'block',
            position: 'relative',
            width: this._options.responsive ? '100%' : `${this._options.width}px`,
            height: `${this._options.height}px`,
            overflow: 'hidden'
        });
        this._createCanvas();
    }

    /**
     * Create the HTML canvas element in which we will draw the waveform.
     *
     * @returns {void}
     */
    _createCanvas() {
        const {clientWidth} = this._waveContainer;
        const canvas = this._waveContainer.appendChild(
            style(document.createElement('canvas'), {
                position: 'absolute',
                top: 0,
                bottom: 0,
                zIndex: 1,
                height: `${this._options.height}px`,
                width: `${clientWidth}px` // For responsive, enough to set this to 100% ???
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
     * @returns {void}
     */
    _addCanvasHandlers() {
        this._mouseClickHandler = e => (
            WavePlayer._mediator
                .fire('waveview:clicked', this._coord2Progress(e))
        );
        this._canvasContext.canvas
            .addEventListener('click', this._mouseClickHandler.bind(this));
    }

    /**
     * Remove the canvas click handler.
     *
     * @returns {void}
     */
    _removeCanvasHandlers() {
        if (this._mouseClickHandler) {
            this.canvasContext.canvas
                .removeEventListener('click', this._mouseClickHandler);
        }
    }

    /**
     * Create a color stop variation for the colors provided (used for drawing
     * the gradient).
     *
     * @returns {Object}
     */
    _createColorVariations() {
        const colors = {waveColor: [], progressColor: []};

        for (const c in colors) {
            let tmp = hex2rgb(this._options[c]);
            colors[c].push(tmp);
            tmp = rgb2hsv(tmp);
            colors[c].push(hsv2rgb({h: tmp.h, s: tmp.s, v: tmp.v * 1.4}));
        }

        colors.dc = {
            r: colors.waveColor[0].r - colors.progressColor[0].r,
            g: colors.waveColor[0].g - colors.progressColor[0].g,
            b: colors.waveColor[0].b - colors.progressColor[0].b
        };

        return colors;
    }

    /**
     * Initialize the resize handler for the waveview. If the waveview instance
     * is not in responsive mode we do nothing on a resize event, meaning the
     * wave will not be redrawn. If we are in responsive mode the width of the
     * canvas is rescaled and hence the waveform needs to be redrawn after this.
     *
     * @returns {void}
     */
    _initializeResizeHandler() {
        if (!this._options.responsive) {
            if (this._resizeHandler) {
                window.removeEventListener('resize', this._resizeHandler);
            }
            style(this._waveContainer, {width: this._options.width});

            return;
        }

        style(this._waveContainer, {width: '100%'});

        if (this._resizeHandler) {
            window.removeEventListener('resize', this._resizeHandler);
        }

        this._resizeHandler = () => {
            const width = this._waveContainer.clientWidth;
            style(this._canvasContext.canvas, {width: `${width}px`});
            this._canvasContext.canvas.width = width;
            this._barData = this._calcAvgAmps();
            this.updateWave(this._progress);
        };
        window.addEventListener('resize', this._resizeHandler);
    }

    /**
     * Compute average absolute waveform amplitudes.
     *
     * @returns {Object}
     */
    _calcAvgAmps() {
        // Compute amplitude by averaging over n values in the range
        // [rangeL, rangeR]
        const avgAmp = (dataIndex, rangeL, rangeR, n) => {
            let sum = 0.0;
            for (let i = rangeL; i <= rangeR; i++) {
                sum += Math.abs(this._data[dataIndex + i]);
            }

            return sum / n;
        };

        const totalWidth = this._waveContainer.clientWidth;
        const ratio = totalWidth !== this._data.length
            ? this._data.length / totalWidth
            : 1;
        const totalBarWidth = this._options.barWidth + this._options.barGap;
        let rangeR = (totalBarWidth - 1) / 2;
        const rangeL = -~~rangeR;
        const incr = totalBarWidth * ratio;
        const bd = {amps: [], x: []};
        rangeR = Math.round(rangeR);

        bd.amps.push(avgAmp(0, 0, rangeR, totalBarWidth));
        bd.x.push(0);
        let i, j;
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

    /**
     * Draw the individual waveform bars with a gradient.
     *
     * @param  {number} progressCoord
     * @returns {void}
     */
    _drawBars(progressCoord) {
        if (!this._barData) return;

        const ctx = this._canvasContext;
        const h0 = ctx.canvas.height;
        const totalBarWidth = this._options.barWidth + this._options.barGap;
        let changeGrad = true;
        ctx.fillStyle = this._options.useGradient
            ? this._generateGradient(this._colors.progressColor, h0)
            : this._generateColor(this._colors.progressColor[0]);

        for (let i = 0; i < this._barData.x.length; i++) {
            const xpos = this._barData.x[i];
            if (xpos >= progressCoord - totalBarWidth && changeGrad) {
                if (xpos >= progressCoord) { // gradient rule for bars after currently playing bar
                    ctx.fillStyle = this._options.useGradient
                        ? this._generateGradient(this._colors.waveColor, h0)
                        : this._generateColor(this._colors.waveColor[0]);
                    changeGrad = false; // more efficient: avoids changing this gradient rule multiple times per single function call
                } else { // fade between colors when on currently playing bar
                    const incr = (progressCoord - xpos) / totalBarWidth;
                    const c1 = {
                        r: this._colors.waveColor[0].r - this._colors.dc.r * incr,
                        g: this._colors.waveColor[0].g - this._colors.dc.g * incr,
                        b: this._colors.waveColor[0].b - this._colors.dc.b * incr
                    };

                    let c2 = null;
                    if (this._options.useGradient) {
                        c2 = rgb2hsv(c1);
                        c2 = hsv2rgb({h: c2.h, s: c2.s, v: c2.v * 1.4});
                    }

                    ctx.fillStyle = this._options.useGradient
                        ? this._generateGradient([c1, c2], h0)
                        : this._generateColor(c1);
                }
            }
            const h = Math.max(h0 * this._barData.amps[i] * this._barData.norm, 0.5);
            ctx.fillRect(xpos, (h0 - h) / 2, this._options.barWidth, h);
        }
    }

    /**
     * Generate a linear gradient from the provided colors.
     *
     * @param  {Array} c
     * @param  {number} h
     * @returns {Object}
     */
    _generateGradient(c, h) {
        const grd = this._canvasContext.createLinearGradient(0, 0, 0, h);
        const c1 = `rgba(${~~c[1].r}, ${~~c[1].g}, ${~~c[1].b}, 1)`;
        grd.addColorStop(0.0, c1);
        grd.addColorStop(0.3, `rgba(${~~c[0].r}, ${~~c[0].g}, ${~~c[0].b}, 1)`);
        grd.addColorStop(1.0, c1);

        return grd;
    }

    /**
     * Generate a CSS color string from a given color object.
     *
     * @param  {Object} c
     * @returns {string}
     */
    _generateColor(c) {
        return `rgb(${~~c.r}, ${~~c.g}, ${~~c.b})`;
    }

    /**
     * Calculate the x-coordinate of the current mouse position. The origin is
     * assumed to be at the location of the waveform container HTML element.
     *
     * @param  {MouseEvent} e
     * @returns {number}
     */
    _calcMouseCoordX(e) {
        e.preventDefault();
        return e.clientX - this._waveContainer.getBoundingClientRect().left;
    }

    /**
     * Convert a coordinate to a progress in the range [0-1].
     *
     * @param  {MouseEvent} e
     * @returns {number}
     */
    _coord2Progress(e) {
        return this._calcMouseCoordX(e) / this._waveContainer.clientWidth;
    }

}

export default WaveView;
