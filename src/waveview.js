/*
 * waveview.js
 *
 * © Michaël Dzjaparidze 2015
 * http://www.michaeldzjaparidze.com, https://github.com/michaeldzjap
 *
 * Draws a waveform using the HTML5 canvas object
 *
 * This work is licensed under the MIT License (MIT)
 */

 'use strict';

function WaveView() {
  this.init.apply(this, arguments);
}

WaveView.prototype = (function() {

  function _validateParams() {
    // check if container element exists
    this.container = 'string' == typeof this._params.container ?
      document.querySelector(this._params.container) : this._params.container;
    if (!this.container)
      throw new Error('Please supply a valid container element');
  }

  function _createWaveContainer() {
    this.waveContainer = document.createElement('div');
    this.waveContainer.className = 'waveform-container';
    this.container.appendChild(this.waveContainer);
    this.style(this.waveContainer, {
      display: 'block',
      position: 'relative',
      width: '100%',
      height: this._params.height + 'px',
      overflow: 'hidden'
    });
    _createCanvas.call(this);
  }

  function _createCanvas() {
    var clientWidth = this.waveContainer.clientWidth;
    var canvas = this.waveContainer.appendChild(
      this.style(document.createElement('canvas'), {
        position: 'absolute',
        top: 0,
        bottom: 0,
        zIndex: 1,
        height: this._params.height + 'px',
        width: clientWidth + 'px'          // for responsive, enough to set this to 100% ???
      })
    );
    this.canvasContext = canvas.getContext('2d');
    this.canvasContext.canvas.width = clientWidth;
    this.canvasContext.canvas.height = this._params.height;
    if (this._params.interact)
      _addCanvasHandlers.call(this);
  }

  function _addCanvasHandlers() {
    this.__mouseClickHandler = _mouseClickHandler.bind(this);
    this.canvasContext.canvas.addEventListener('click', this.__mouseClickHandler);
  }

  function _removeCanvasHandlers() {
    this.canvasContect.canvas.removeEventListener('click', this.__mouseClickHandler);
  }

  function _mouseClickHandler(e) {
    this._mediator.fire('waveclicked', _coord2Progress.call(this, e));
  }

  function _resizeHandler() {
    if (this._params.responsive) {
      if (this.__resizeHandler)
        window.removeEventListener('resize', this.__resizeHandler);
      this.__resizeHandler = (function(e) {
        var width = this.waveContainer.clientWidth
        this.style(this.canvasContext.canvas, { width: width + 'px' });
        this.canvasContext.canvas.width = width;
        this._barData = _calcAvgAmps.call(this);
        this.updateWave(this._progress);
      }).bind(this);
      window.addEventListener('resize', this.__resizeHandler);
    } else {
      if (this.__resizeHandler)
        window.removeEventListener('resize', this.__resizeHandler);
    }
  }

  function _calcMouseCoordX(e) {
    e.preventDefault();
    return e.clientX - this.waveContainer.getBoundingClientRect().left;
  }

  function _coord2Progress(e) {
    return _calcMouseCoordX.call(this, e)/this.waveContainer.clientWidth;
  }

  // compute average absolute waveform amplitudes
  function _calcAvgAmps() {

    // compute amplitude by averaging over n values  in the range [rangeL, rangeR]
    function avgAmp(dataIndex, rangeL, rangeR, n) {
      var sum = 0.0;
      for (var i=rangeL; i<=rangeR; i++)
        sum += Math.abs(data[dataIndex + i]);
      return sum/n;
    }

    var totalWidth = this.waveContainer.clientWidth,
      data = this._params.data,
      ratio = totalWidth !== data.length ? data.length/totalWidth : 1,
      totalBarWidth = this._params.barWidth + this._params.barGap,
      rangeR = (totalBarWidth - 1)/2,
      rangeL = -~~rangeR,
      incr = totalBarWidth*ratio,
      bd = { amps: [], x: [] };
    rangeR = Math.round(rangeR);
    this._totalBarWidth = totalBarWidth;

    bd.amps.push(avgAmp(0, 0, rangeR, totalBarWidth));
    bd.x.push(0);
    var i, j;
    for (i=totalBarWidth, j=incr; j+rangeR<data.length; i+=totalBarWidth, j+=incr) {
      bd.amps.push(avgAmp(~~j, rangeL, rangeR, totalBarWidth));
      bd.x.push(i);
    }
    // see if we can squeeze in one more bar
    j = ~~j;
    rangeR = -(j - data.length + 1);
    if (i <= totalWidth - totalBarWidth && rangeR > rangeL) {
      bd.amps.push(avgAmp(j, rangeL, rangeR, rangeR - rangeL));
      bd.x.push(i);
    }
    bd.norm = 1/Math.max.apply(Math, bd.amps);

    return bd;

    /* nrOfBars = ~~((data.length + this._params.barGap)/(totalBarWidth*ratio)) + 1 */
  }

  function _setupGradient(c, h) {
    var grd = this.canvasContext.createLinearGradient(0, 0, 0, h),
      c1 = 'rgba(' + ~~c[1].r + ', ' + ~~c[1].g + ', ' + ~~c[1].b + ', 1)';
    grd.addColorStop(0.0, c1);
    grd.addColorStop(0.3, 'rgba(' + ~~c[0].r + ', ' + ~~c[0].g + ', ' + ~~c[0].b + ', 1)');
    grd.addColorStop(1.0, c1);
    return grd;
  }

  // draw bars with a gradient
  function _drawBars(progressCoord) {
    var totalWidth = this.waveContainer.clientWidth, ctx = this.canvasContext,
      h0 = ctx.canvas.height, bd = this._barData, changeGrad = true,
      bw = this._totalBarWidth, progressColorFlag = true, waveColorFlag = true,
      gradient = _setupGradient.call(this, this._colors.progressColor, h0);

    ctx.fillStyle = gradient;

    for (var i=0; i<bd.x.length; i++) {
      var xpos = bd.x[i];
      if (xpos >= progressCoord - bw && changeGrad) {
        if (xpos >= progressCoord) {   // gradient rule for bars after currently playing bar
          gradient = _setupGradient.call(this, this._colors.waveColor, h0);
          ctx.fillStyle = gradient;
          changeGrad = false;   // more efficient: avoids changing this gradient rule multiple times per single function call
        } else {  // fade between colors when on currently playing bar
          var incr = (progressCoord - xpos)/bw,
            c1 = {
              r: this._colors.waveColor[0].r - this._colors.dc.r*incr,
              g: this._colors.waveColor[0].g - this._colors.dc.g*incr,
              b: this._colors.waveColor[0].b - this._colors.dc.b*incr
            },
            c2 = WP.UTILS.rgb2hsv(c1),
            c2 = WP.UTILS.hsv2rgb({ h: c2.h, s: c2.s, v: c2.v*1.4 });
          gradient = _setupGradient.call(this, [c1, c2], h0);
          ctx.fillStyle = gradient;
        }
      }
      var h = Math.max(h0*bd.amps[i]*bd.norm, 0.5);
      ctx.fillRect(xpos, (h0 - h)/2, this._params.barWidth, h);
    }

  }

  // create a color stop variation for the colors provided (used for drawing the gradient)
  function _createColorVariations() {
    var colors = { waveColor: [], progressColor: [] };
    for (var c in colors) {
      var tmp = WP.UTILS.hex2rgb(this._params[c]);
      colors[c].push(tmp);
      tmp = WP.UTILS.rgb2hsv(tmp);
      colors[c].push(WP.UTILS.hsv2rgb({ h: tmp.h, s: tmp.s, v: tmp.v*1.4 }));
    }
    colors.dc = {
      r: (colors.waveColor[0].r - colors.progressColor[0].r),
      g: (colors.waveColor[0].g - colors.progressColor[0].g),
      b: (colors.waveColor[0].b - colors.progressColor[0].b)
    };
    return colors;
  }

  return {

    constructor: WaveView,

    init: function(options) {
      this.defaultOptions = {
        container: null,
        height: 128,
        waveColor: '#428bca',
        progressColor: '#31708f',
        barWidth: 4,
        barGap: 1,
        interact: true,
        responsive: true,
        data: null
      };
      this._params = WP.UTILS.extend({}, this.defaultOptions, options);
      this._mediator = options.mediator ? options.mediator : new Mediator();

      _validateParams.call(this);
      _createWaveContainer.call(this);
      this._colors = _createColorVariations.call(this);
      _resizeHandler.call(this);

    },

    style: function(elm, styles) {
      for (var key in styles) {
        if (elm.style[key] !== styles[key])
          elm.style[key] = styles[key];
      }
      return elm;
    },

    data: function(data) {
      if (data)
        this._params.data = data;
      else
        return this._params.data;
    },

    // draw a wave from supplied waveform data
    drawWave: function(data, progress) {
      this._params.data = data;
      this._progress = progress;
      this._barData = _calcAvgAmps.call(this);
      this.clearWave();
      _drawBars.call(this, progress*this.waveContainer.clientWidth);
    },

    // update an existing wave
    updateWave: function(progress) {
      this._progress = progress;
      this.clearWave();
      _drawBars.call(this, progress*this.waveContainer.clientWidth);
    },

    // clear the wave before new drawing
    clearWave: function() {
      this.canvasContext.clearRect(0, 0, this.canvasContext.canvas.width, this.canvasContext.canvas.height);
    },

    interact: function(bool) {
      if (bool === null || bool === 'undefined')
        return this._params.interact;
      else {
        this._params.interact = bool;
        if (bool)
          _addCanvasHandlers.call(this);
        else
          _removeCanvasHandlers.call(this);
      }
    },

    responsive: function(bool) {
      if (bool === null || bool === 'undefined')
        return this._params.responsive;
      else
        this._params.responsive = bool;
      _resizeHandler.call(this);
    },

    destroy: function() {
      _removeCanvasHandlers.call(this);
      if (this.__resizeHandler)
        window.removeEventListener('resize', this.__resizeHandler);
      this._mediator.unAll();
      this.waveContainer && this.container.removeChild(this.waveContainer);
      this.waveContainer = null;
    }

  };

})();
