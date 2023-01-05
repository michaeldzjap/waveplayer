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
 * Reduce a multi dimensional array of amplitudes to a single array of amplitudes
 * by computing the average.
 *
 * @param {number[][]} input
 * @returns {number[]}
 */
const averageChannels = (input: number[][]): number[] => {
    const output = Array(input[0].length);

    for (let i = 0; i < output.length; i++) {
        let sum = 0;

        for (let j = 0; j < input.length; j++) {
            sum += input[j][i];
        }

        output[i] = sum / input.length;
    }

    return output;
};

/**
 * Reduce the amplitude data of an audio file by linearly interpolating the original
 * amplitude data at equally spaced points and summing over channels.
 *
 * @param {ArrayBuffer} data
 * @param {AudioContext} context
 * @param {Object} options
 * @returns {Promise<number[]>}
 */
const computeAmplitudes = async (
    data: ArrayBuffer,
    context: AudioContext,
    options: Readonly<{ points: number; normalise: boolean; logarithmic: boolean }>,
): Promise<number[]> => {
    const { points, normalise, logarithmic } = options;
    const buffer = await context.decodeAudioData(data);
    const amplitudes: number[][] = Array(buffer.numberOfChannels).fill(new Array(points));

    for (let i = 0; i < buffer.numberOfChannels; i++) {
        const data = buffer.getChannelData(i);
        const ratio = data.length / points;

        for (let j = 0, incr = 0; j < points; j++, incr += ratio) {
            const x = Math.floor(incr);

            amplitudes[i][j] = interpolate(data[x], data[x + 1] ?? 0, incr - x);
        }
    }

    const output = buffer.numberOfChannels > 1 ? averageChannels(amplitudes) : amplitudes[0];

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

    return output;
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
    return new Promise((resolve): void => {
        const context = new AudioContext();
        const request = new XMLHttpRequest();

        request.open('GET', url);
        request.responseType = 'arraybuffer';

        request.onload = async () => {
            const output = await computeAmplitudes(request.response, context, {
                ...{ points: 800, normalise: true, logarithmic: true },
                ...options,
            });

            resolve(output);
        };

        request.send();
    });
};
