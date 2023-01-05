import { readFile } from 'fs';
import { resolve } from 'path';
import { promisify } from 'util';

import { extractAmplitudes, interpolate, lin2log } from '../src/audio';
import { noise, sine } from './stubs/audio';

beforeEach(() => {
    jest.resetAllMocks();
    jest.resetModules();
});

/**
 * Create all XML HTTP request related mocks.
 *
 * @param {string} filename
 * @returns {Promise<Object>}
 */
const mockXHR = async (filename: string) => {
    const content = await promisify(readFile)(resolve(__dirname, 'stubs', filename));

    const mockOpen = jest.fn();
    const mockSend = jest.fn();

    const xhrMock: Partial<XMLHttpRequest> = {
        open: mockOpen,
        send: mockSend,
        responseType: 'arraybuffer',
        response: content.buffer,
        status: 200,
    };

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window.XMLHttpRequest = jest.fn().mockImplementation(() => xhrMock);

    setTimeout(() => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        xhrMock['onload']();
    }, 0);

    return Promise.resolve({ mockOpen, mockSend });
};

/**
 * Create all web audio API related mocks.
 *
 * @param {number} numberOfChannels
 * @param {Float32Array[]} data
 * @returns {Object}
 */
const mockWebAudio = (numberOfChannels: number, data: Float32Array[]) => {
    const mockGetChannelData = jest.fn();

    for (const channel of data) {
        mockGetChannelData.mockReturnValueOnce(channel);
    }

    const mockDecodeAudioData = jest.fn(() =>
        Promise.resolve({ numberOfChannels, getChannelData: mockGetChannelData }),
    );
    const mockAudioContext = jest.fn(() => ({ decodeAudioData: mockDecodeAudioData }));

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window.AudioContext = mockAudioContext;

    return { mockDecodeAudioData, mockGetChannelData };
};

describe('audio', () => {
    describe('interpolate', () => {
        it('linearly interpolates a value between two numbers', () => {
            expect(interpolate(1, 2, 0.5)).toBe(1.5);
        });
    });

    describe('lin2log', () => {
        [
            { linear: 0, expected: 0 },
            { linear: 1, expected: 1 },
            { linear: -1, expected: -1 },
            { linear: 0.1, expected: 0.6666666666666666 },
        ].forEach(({ linear, expected }) => {
            it(`converts a linear amplitude of ${linear} to a decibel scale`, () => {
                expect(lin2log(linear)).toBe(expected);
            });
        });
    });

    describe('extractAmplitudes', () => {
        it('extracts the amplitudes from a mono audio file', async () => {
            const { mockOpen, mockSend } = await mockXHR('sine.wav');
            const { mockDecodeAudioData, mockGetChannelData } = mockWebAudio(1, [sine]);

            const data = await extractAmplitudes('/sine.wav', { points: 256 });

            expect(mockOpen).toHaveBeenCalledWith('GET', '/sine.wav');
            expect(mockSend).toHaveBeenCalled();
            expect(mockDecodeAudioData).toHaveBeenCalled();
            expect(mockGetChannelData).toHaveBeenCalledTimes(1);
            expect(data).toHaveLength(256);
        });

        it('extracts the amplitudes from a stereo audio file', async () => {
            const { mockOpen, mockSend } = await mockXHR('noise.wav');
            const { mockDecodeAudioData, mockGetChannelData } = mockWebAudio(2, noise);

            const data = await extractAmplitudes('/noise.wav', { points: 256, logarithmic: true });

            expect(mockOpen).toHaveBeenCalledWith('GET', '/noise.wav');
            expect(mockSend).toHaveBeenCalled();
            expect(mockDecodeAudioData).toHaveBeenCalled();
            expect(mockGetChannelData).toHaveBeenCalledTimes(2);
            expect(data).toHaveLength(256);
        });
    });
});
