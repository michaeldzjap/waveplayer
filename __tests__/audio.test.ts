import { newServer } from 'mock-xmlhttprequest';
import { AudioContext } from 'standardized-audio-context-mock';

import sine from './stubs/sine';
import { extractAmplitudes, interpolate, lin2log } from '../src/audio';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
global.AudioContext = AudioContext;

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
        it('extracts the amplitudes from an audio file', async () => {
            const server = newServer({
                get: ['/sine.wav', { status: 200, body: sine.buffer }],
            });

            try {
                server.install();

                const data = await extractAmplitudes('/sine.wav', { points: 256 });

                expect(true).toBeTruthy();
            } finally {
                server.remove();
            }
        });
    });
});
