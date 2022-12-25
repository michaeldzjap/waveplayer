/**
 * Linearly interpolate a value between two numbers at a specified decimal midpoint.
 *
 * @param {number} x
 * @param {number} y
 * @param {number} frac
 * @returns {number}
 */
export const interpolate = (x: number, y: number, frac: number): number => {
    return x * (1 - frac) + y * frac;
};

/**
 * Convert linear amplitudes to a decibel scale and map them to the range [-1.0, 1.0].
 *
 * NOTE: Amplitudes are clipped to range [-60dB, 0dB].
 *
 * @param {number} value
 * @returns {number}
 */
export const lin2log = (value: number): number => {
    let db = (3 + Math.log10(Math.min(Math.max(Math.abs(value), 0.001), 1))) / 3;

    if (value < 0) {
        db *= -1;
    }

    return db;
};

/**
 * Extract the amplitude data from an audio file pointed to by "url".
 *
 * @param {string} url
 * @param {Object} options
 * @returns {Promise<number[]>}
 */
export const extractAmplitudes = (
    url: string,
    options: Readonly<Partial<{ points: number; normalise: boolean; logarithmic: boolean }>> = {},
): Promise<number[]> => {
    const { points, normalise, logarithmic } = { ...{ points: 800, normalise: true, logarithmic: true }, ...options };

    return new Promise((resolve): void => {
        const context = new AudioContext();
        const request = new XMLHttpRequest();

        request.open('GET', url);
        request.responseType = 'arraybuffer';

        request.onload = async () => {
            let output: number[];
            const buffer = await context.decodeAudioData(request.response);
            const amplitudes: number[][] = Array(buffer.numberOfChannels).fill(new Array(points));

            for (let i = 0; i < buffer.numberOfChannels; i++) {
                const data = buffer.getChannelData(i);
                const ratio = data.length / points;

                for (let j = 0, incr = 0; j < points; j++, incr += ratio) {
                    const x = Math.floor(incr);

                    amplitudes[i][j] = interpolate(data[x], data[x + 1] ?? 0, incr - x);
                }
            }

            if (buffer.numberOfChannels > 1) {
                output = Array(points);

                for (let i = 0; i < output.length; i++) {
                    let sum = 0;

                    for (let j = 0; j < buffer.numberOfChannels; j++) {
                        sum += amplitudes[j][i];
                    }

                    output[i] = sum / buffer.numberOfChannels;
                }
            } else {
                output = [...amplitudes[0]];
            }

            if (logarithmic) {
                for (let i = 0; i < output.length; i++) {
                    output[i] = lin2log(output[i]);
                }
            }

            if (normalise) {
                const max = Math.max.apply(null, output.map(Math.abs));

                for (let i = 0; i < output.length; i++) {
                    output[i] = output[i] / max;
                }
            }

            resolve(output);
        };

        request.send();
    });
};
