import { readFile } from 'fs';
import { resolve } from 'path';
import { promisify } from 'util';

import { newServer } from 'mock-xmlhttprequest';

import { extractAmplitudes, interpolate, lin2log } from '../src/audio';
import { noise, sine } from './stubs/data';

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
        beforeEach(() => {
            jest.resetAllMocks();
            jest.resetModules();
        });

        it(`extracts the amplitudes from a mono audio file`, async () => {
            const mockGetChannelData = jest.fn(() => {
                return sine;
            });

            const mockDecodeAudioData = jest.fn(() => {
                return Promise.resolve({ numberOfChannels: 1, getChannelData: mockGetChannelData });
            });

            const mockAudioContext = jest.fn(() => {
                return {
                    decodeAudioData: mockDecodeAudioData,
                };
            });

            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            window.AudioContext = mockAudioContext;

            const content = await promisify(readFile)(resolve(__dirname, 'stubs', 'sine.wav'));
            const server = newServer({
                get: [
                    '/sine.wav',
                    {
                        status: 200,
                        headers: { 'accept-ranges': 'bytes', 'content-type': 'audio/wav' },
                        body: content.buffer,
                    },
                ],
            });

            try {
                server.install();

                const data = await extractAmplitudes('/sine.wav', { points: 256 });

                expect(data).toHaveLength(256);
            } finally {
                server.remove();
            }
        });

        it(`extracts the amplitudes from a stereo audio file`, async () => {
            const mockGetChannelData = jest.fn();

            for (const channel of noise) {
                mockGetChannelData.mockReturnValueOnce(channel);
            }

            const mockDecodeAudioData = jest.fn(() => {
                return Promise.resolve({ numberOfChannels: 2, getChannelData: mockGetChannelData });
            });

            const mockAudioContext = jest.fn(() => {
                return {
                    decodeAudioData: mockDecodeAudioData,
                };
            });

            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            window.AudioContext = mockAudioContext;

            const content = await promisify(readFile)(resolve(__dirname, 'stubs', 'noise.wav'));
            const server = newServer({
                get: [
                    '/noise.wav',
                    {
                        status: 200,
                        headers: { 'accept-ranges': 'bytes', 'content-type': 'audio/wav' },
                        body: content.buffer,
                    },
                ],
            });

            try {
                server.install();

                const data = await extractAmplitudes('/noise.wav', { points: 256 });

                expect(data).toHaveLength(256);
            } finally {
                server.remove();
            }
        });
    });
});
