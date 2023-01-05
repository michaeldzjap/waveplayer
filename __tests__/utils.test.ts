import '@testing-library/jest-dom';
import HttpError from '../src/HttpError';

import { style, average, hex2rgb, hsv2rgb, rgb2hsv, throttle, getJson } from '../src/utils';

beforeEach(() => {
    jest.resetAllMocks();
    jest.resetModules();
});

/**
 * Create all XML HTTP request related mocks.
 *
 * @param {number} status
 * @returns {Promise<Object>}
 */
const mockXHR = (status: number) => {
    const mockOpen = jest.fn();
    const mockSend = jest.fn();

    const xhrMock: Partial<XMLHttpRequest> = {
        open: mockOpen,
        send: mockSend,
        responseType: 'json',
        response: [1, 2, 3],
        status,
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

describe('utils', () => {
    describe('style', () => {
        it('sets the CSS style properties for a given HTML element', () => {
            const element = document.createElement('div');

            style(element, { position: 'absolute' });

            expect(element).toHaveStyle({ position: 'absolute' });
            expect(element).not.toHaveStyle({ top: '0' });
        });
    });

    describe('average', () => {
        [
            { start: 0, end: 2, expected: 0.5 },
            { start: 1, end: 3, expected: 0.5 },
            { start: 2, end: 4, expected: 0.5 },
        ].forEach(({ start, end, expected }) => {
            it(`computes the average from ${start} to ${end} of a range of values`, () => {
                expect(average([-0.5, 0.5, 0.5, -0.5], start, end)).toBe(expected);
            });
        });
    });

    describe('hex2rgb', () => {
        [
            { label: 'hex with #', hex: '#ffffff', rgb: { r: 255, g: 255, b: 255 } },
            { label: 'hex without #', hex: 'ffffff', rgb: { r: 255, g: 255, b: 255 } },
        ].forEach(({ label, hex, rgb }) => {
            it(`converts a ${label} color string to RGB format`, () => {
                expect(hex2rgb(hex)).toEqual(rgb);
            });
        });
    });

    describe('rgb2hsv', () => {
        [
            { label: 'lila', rgb: { r: 201, g: 100, b: 200 }, hsv: { h: 301, s: 50, v: 79 } },
            { label: 'green', rgb: { r: 100, g: 200, b: 100 }, hsv: { h: 120, s: 50, v: 78 } },
            { label: 'black', rgb: { r: 0, g: 0, b: 0 }, hsv: { h: 0, s: 0, v: 0 } },
        ].forEach(({ label, rgb, hsv }) => {
            it(`converts a ${label} color in RGB format to HSV format`, () => {
                expect(rgb2hsv(rgb)).toEqual(hsv);
            });
        });
    });

    describe('hsv2rgb', () => {
        [
            { hsv: { h: 0, s: 0, v: 100 }, rgb: { r: 255, g: 255, b: 255 } },
            { hsv: { h: 100, s: 0, v: 100 }, rgb: { r: 255, g: 255, b: 255 } },
            { hsv: { h: 150, s: 0, v: 100 }, rgb: { r: 255, g: 255, b: 255 } },
            { hsv: { h: 200, s: 0, v: 100 }, rgb: { r: 255, g: 255, b: 255 } },
            { hsv: { h: 250, s: 0, v: 100 }, rgb: { r: 255, g: 255, b: 255 } },
            { hsv: { h: 300, s: 0, v: 100 }, rgb: { r: 255, g: 255, b: 255 } },
        ].forEach(({ rgb, hsv }) => {
            it(`converts a color with hue ${hsv.h} in HSV format to RGB format`, () => {
                expect(hsv2rgb(hsv)).toEqual(rgb);
            });
        });
    });

    describe('throttle', () => {
        it('waits 500 milliseconds before executing the callback', () => {
            jest.useFakeTimers();

            const callback = jest.fn();
            const fn = throttle(callback, 500);

            for (let i = 0; i < 2; i++) {
                fn();
            }

            jest.runAllTimers();

            expect(callback).toHaveBeenCalledTimes(1);
        });
    });

    describe('getJson', () => {
        it('successfully fetches and parses a JSON file', async () => {
            jest.useRealTimers();

            const { mockOpen, mockSend } = await mockXHR(200);

            await expect(getJson<number[]>('/sample.json')).resolves.toEqual([1, 2, 3]);
            expect(mockOpen).toHaveBeenCalledWith('GET', '/sample.json');
            expect(mockSend).toHaveBeenCalled();
        });

        it('fails to fetch and parses a JSON file', async () => {
            jest.useRealTimers();

            const { mockOpen, mockSend } = await mockXHR(404);

            await expect(getJson<number[]>('/sample.json')).rejects.toBeInstanceOf(HttpError);
            expect(mockOpen).toHaveBeenCalledWith('GET', '/sample.json');
            expect(mockSend).toHaveBeenCalled();
        });
    });
});
