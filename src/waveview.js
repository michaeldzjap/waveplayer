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
        data: null
    };

    constructor(options) {

    }

}

export default WaveView;
