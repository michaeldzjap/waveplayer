/*********************
 * UTILITY FUNCTIONS *
 *********************/

/**
 * Convert a hex color code to RGB format.
 *
 * @param  {string} hex
 * @returns {Object}
 */
export const hex2rgb = hex => {
    const bigint = parseInt(
        hex.charAt(0) === '#' ? hex.substring(1, 7) : hex, 16
    );

    return {r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: bigint & 255};
};

/**
 * Convert a color in RGB format to a color in HSV format.
 *
 * @param  {Object} rgb
 * @returns {Object}
 */
export const rgb2hsv = rgb => {
    const r = rgb.r / 255;
    const g = rgb.g / 255;
    const b = rgb.b / 255;
    const v = Math.max(r, g, b);
    const diff = v - Math.min(r, g, b);
    const diffc = c => (v - c) / 6 / diff + 1 / 2;

    if (diff === 0) {
        return {h: 0, s: 0, v: Math.round(v * 100)};
    }

    let h;
    const s = diff / v;
    const rr = diffc(r);
    const gg = diffc(g);
    const bb = diffc(b);

    if (r === v) {
        h = bb - gg;
    } else if (g === v) {
        h = 1 / 3 + rr - bb;
    } else if (b === v) {
        h = 2 / 3 + gg - rr;
    }

    if (h < 0) {
        h++;
    } else if (h > 1) {
        h--;
    }

    return {h: Math.round(h * 360), s: Math.round(s * 100), v: Math.round(v * 100)};
};

/**
 * Convert a color in HSV format to a color in RGB format.
 *
 * @param  {Object} hsv
 * @returns {Object}
 */
export const hsv2rgb = hsv => {
    if (hsv.s === 0) {
        return {r: hsv.v, g: hsv.v, b: hsv.v};
    }

    const h = hsv.h / 60;
    const i = Math.floor(h);
    const s = hsv.s / 100;
    const v = hsv.v / 100 * 255;
    const data = [
        v * (1 - s),
        v * (1 - s * (h - i)),
        v * (1 - s * (1 - (h - i)))
    ];
    switch (i) {
        case 0:
            return {r: v, g: data[2], b: data[0]};
        case 1:
            return {r: data[1], g: v, b: data[0]};
        case 2:
            return {r: data[0], g: v, b: data[2]};
        case 3:
            return {r: data[0], g: data[1], b: v};
        case 4:
            return {r: data[2], g: data[0], b: v};
        default:
            return {r: v, g: data[0], b: data[1]};
    }
};

/**
 * Fetch a JSON file from the given URL.
 *
 * @param  {string} url
 * @returns {Promise}
 */
export const getJSON = url => (
    new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url);
        xhr.onreadystatechange = () => {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                if (xhr.status === 200) {
                    resolve(JSON.parse(xhr.responseText));
                } else {
                    reject(new Error(xhr.statusText));
                }
            }
        };
        xhr.send();
    })
);

/**
 * Convert a generator into a promise resolving state machine.
 *
 * @param  {Generator} generatorFunction
 * @returns {Promise}
 */
export const stateResolver = generatorFunction => (
    function () {
        const generator = generatorFunction.apply(this, arguments);
        return new Promise((resolve, reject) => {
            const resume = (method, value) => {
                try {
                    const result = generator[method](value);
                    if (result.done) {
                        resolve(result.value);
                    } else {
                        result.value.then(resumeNext, resumeThrow);
                    }
                } catch (e) {
                    reject(e);
                }
            };
            const resumeNext = resume.bind(null, 'next');
            const resumeThrow = resume.bind(null, 'throw');
            resumeNext();
        });
    }
);

/**
 * Set the CSS styles for the given element.
 *
 * @param  {Object} elm
 * @param  {Object} styles
 * @returns {Object}
 */
export const style = (elm, styles) => {
    for (const key in styles) {
        if (elm.style[key] !== styles[key]) {
            elm.style[key] = styles[key];
        }
    }

    return elm;
};

/**
 * Check if the given value is an object.
 *
 * @param  {mixed} value
 * @returns {boolean}
 */
export const isObject = value => {
    const type = typeof value;
    return value !== null && (type === 'object' || type === 'function');
};

/**
 * Check if the given value is a string.
 *
 * @param  {mixed} value
 * @returns {boolean}
 */
export const isString = value => {
    const type = typeof value;
    return type === 'string'
        || (type === 'object' && value !== null && !Array.isArray(value)
            && Object.prototype.toString.call(value) === '[object String]');
};
