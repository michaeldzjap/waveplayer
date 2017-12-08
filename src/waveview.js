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

import { style, hex2rgb, rgb2hsv, hsv2rgb } from './lib/index.js';

class WaveView {

    /**
     * The default options for a new instance.
     *
     * @var {object}
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
     * The progress in the range [0-1] of the waveform.
     *
     * @var {number}
     */
    _progress = 0;

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

    /**
     * Get the width of the drawn waveform.
     *
     * @return {number}
     */
    get width() {
        return this._waveContainer.clientWidth;
    }

    /**
     * Set the width of the drawn waveform. Only has an effect if the waveview
     * instance is not operating in responsive mode.
     *
     * @param {number} value
     * @return {void}
     */
    set width(value) {
        this._options.width = value;
        if (!this._options.responsive) {
            style(this._waveContainer, {width: this._options.width + 'px'});
            style(this._canvasContext.canvas, {width: this._options.width + 'px'});
            this._canvasContext.canvas.width = this._options.width;
            this._barData = this._calcAvgAmps();
        }
    }

    /**
     * Get the height of the drawn waveform.
     *
     * @return {number}
     */
    get height() {
        return this._waveContainer.clientHeight;
    }

    /**
     * Set the height of the drawn waveform.
     *
     * @param {number} value
     * @return {void}
     */
    set height(value) {
        this._options.height = value;
        style(this._waveContainer, {height: this._options.height + 'px'});
        style(this.canvasContext.canvas, {height: this._options.height + 'px'});
        this._canvasContext.canvas.height = this._options.height;
        this._barData = this._calcAvgAmps();
    }

    /*********************
     * Public functions. *
     *********************/

    /**
     * Draw a waveform from supplied waveform data.
     *
     * @param {array} values
     * @param {number} progress
     * @param {void}
     */
    drawWave(values, progress) {
        this.data = values;
        this._progress = progress;
        this._barData = this._calcAvgAmps();
        this.clearWave();
        this._drawBars(this._progress * this._waveContainer.clientWidth);
    }

    /**
     * Update an existing waveform.
     *
     * @param {number} progress
     * @return {void}
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
     * @return {void}
     */
    clearWave() {
        this._canvasContext.clearRect(0, 0, this._canvasContext.canvas.width, this._canvasContext.canvas.height);
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
        style(this._waveContainer, {
            display: 'block',
            position: 'relative',
            width: this._options.responsive ? '100%' : this._options.width + 'px',
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
            style(this._waveContainer, {width: this._options.width});

            return;
        }

        style(this._waveContainer, {width: '100%'});

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

    /**
     * Draw the individual waveform bars with a gradient.
     *
     * @param {number} progressCoord
     * @return {void}
     */
    _drawBars(progressCoord) {
        const ctx = this.canvasContext;
        const h0 = ctx.canvas.height;
        const totalBarWidth = this._options.barWidth + this._options.barGap;
        let changeGrad = true;
        let gradient = this._generateGradient(this._colors.progressColor, h0);

        ctx.fillStyle = gradient;

        for (let i = 0; i < this._barData.x.length; i++) {
            const xpos = this._barData.x[i];
            if (xpos >= progressCoord - totalBarWidth && changeGrad) {
                if (xpos >= progressCoord) {   // gradient rule for bars after currently playing bar
                    gradient = this._generateGradient(this._colors.waveColor, h0);
                    ctx.fillStyle = gradient;
                    changeGrad = false;   // more efficient: avoids changing this gradient rule multiple times per single function call
                } else {  // fade between colors when on currently playing bar
                    const incr = (progressCoord - xpos) / totalBarWidth;
                    const c1 = {
                        r: this._colors.waveColor[0].r - this._colors.dc.r * incr,
                        g: this._colors.waveColor[0].g - this._colors.dc.g * incr,
                        b: this._colors.waveColor[0].b - this._colors.dc.b * incr
                    };
                    let c2 = rgb2hsv(c1);
                    c2 = hsv2rgb({h: c2.h, s: c2.s, v: c2.v * 1.4});
                    gradient = this._generateGradient([c1, c2], h0);
                    ctx.fillStyle = gradient;
                }
            }
            const h = Math.max(h0 * this._barData.amps[i] * this._barData.norm, 0.5);
            ctx.fillRect(xpos, (h0 - h) / 2, this._options.barWidth, h);
        }
    }

    /**
     * Generate a linear gradient from the provided colors.
     *
     * @param {array} c
     * @param {number} h
     * @return {object}
     */
    _generateGradient(c, h) {
        const grd = this.canvasContext.createLinearGradient(0, 0, 0, h);
        const c1 = 'rgba(' + ~~c[1].r + ', ' + ~~c[1].g + ', ' + ~~c[1].b + ', 1)';
        grd.addColorStop(0.0, c1);
        grd.addColorStop(0.3, 'rgba(' + ~~c[0].r + ', ' + ~~c[0].g + ', ' + ~~c[0].b + ', 1)');
        grd.addColorStop(1.0, c1);

        return grd;
    }

    /**
     * Calculate the x-coordinate of the current mouse position. The origin is
     * assumed to be at the location of the waveform container HTML element.
     *
     * @param {object} e
     * @return {number}
     */
    _calcMouseCoordX(e) {
        e.preventDefault();
        return e.clientX - this._waveContainer.getBoundingClientRect().left;
    }

    /**
     * Convert a coordinate to a progress in the range [0-1].
     *
     * @param {object} e
     * @return {number}
     */
    _coord2Progress(e) {
        return this._calcMouseCoordX(e) / this._waveContainer.clientWidth;
    }

}

export default WaveView;
