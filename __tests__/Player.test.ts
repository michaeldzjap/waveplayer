import '@testing-library/jest-dom';

import * as audio from '../src/audio';
import * as utils from '../src/utils';
import Player, { DataStrategy, JsonStrategy, WebAudioStrategy } from '../src/Player';
import View from '../src/View';
import sine from './stubs/sine';

jest.mock('../src/View');

const ViewMock = View as unknown as jest.Mock<View>;

beforeEach(() => {
    ViewMock.mockClear();
});

afterEach(() => {
    jest.resetAllMocks();
    jest.resetModules();
});

/**
 * Create all HTML audio element related mocks.
 *
 * @returns {Object}
 */
const mockAudioElement = () => {
    const mockLoad = jest.fn();
    const mockPlay = jest.fn(() => Promise.resolve());
    const mockPause = jest.fn();

    HTMLMediaElement.prototype.load = mockLoad;
    HTMLMediaElement.prototype.play = mockPlay;
    HTMLMediaElement.prototype.pause = mockPause;

    return { mockLoad, mockPlay, mockPause };
};

/**
 * Explicitly mock the getter for the canvas element on the view mock prototype.
 *
 * Necessary because of Necessary because of https://github.com/facebook/jest/issues/9675
 *
 * @returns {HTMLAudioElement}
 */
const mockCanvas = (): HTMLCanvasElement => {
    const canvas = document.createElement('canvas');

    Object.defineProperty(View.prototype, 'canvas', {
        get: jest.fn(() => canvas),
        configurable: true,
    });

    return canvas;
};

/**
 * Explicitly mock the getter for the container element on the view mock prototype.
 *
 * Necessary because of Necessary because of https://github.com/facebook/jest/issues/9675
 *
 * @param {HTMLDivElement} container
 * @returns {HTMLAudioElement}
 */
const mockContainer = (container: HTMLDivElement): HTMLDivElement => {
    Object.defineProperty(View.prototype, 'container', {
        get: jest.fn(() => container),
        configurable: true,
    });

    return container;
};

describe('Player', () => {
    it('creates a new instance when referencing an existing audio element', () => {
        document.body.innerHTML = '<div id="container"><audio id="audio"></audio></div>';

        mockCanvas();

        const player = new Player(new ViewMock([], { container: '#container' }), { audioElement: '#audio' });

        expect(player).toBeInstanceOf(Player);
        expect(ViewMock).toHaveBeenCalled();
    });

    it('creates a new instance for an existing audio element', () => {
        document.body.innerHTML = '<div id="container"><audio id="audio"></audio></div>';

        const audioElement = document.querySelector<HTMLAudioElement>('#audio');

        if (!audioElement) return;

        mockCanvas();

        const player = new Player(new ViewMock([], { container: '#container' }), { audioElement });

        expect(player).toBeInstanceOf(Player);
        expect(ViewMock).toHaveBeenCalled();
    });

    it('throws an error for a non existing audio element', () => {
        expect(() => {
            document.body.innerHTML = '<div id="container"></div>';

            return new Player(new ViewMock([], { container: '#container' }), { audioElement: 'foo' });
        }).toThrow('Audio element could not be located.');
    });

    it('creates a new audio element when one is not provided explicitly', () => {
        document.body.innerHTML = '<div id="container"></div>';

        const container = document.querySelector<HTMLDivElement>('#container');

        if (!container) return;

        mockContainer(container);
        mockCanvas();

        const player = new Player(new ViewMock([], { container: '#container' }));
        const audioElement = document.querySelector<HTMLAudioElement>('#audio');

        if (!audioElement) return;

        expect(player).toBeInstanceOf(Player);
        expect(audioElement).toBeInstanceOf(HTMLAudioElement);
        expect(ViewMock).toHaveBeenCalled();
    });

    it('gets and sets the audio volume', () => {
        document.body.innerHTML = '<div id="container"><audio id="audio"></audio></div>';

        mockCanvas();

        const player = new Player(new ViewMock([], { container: '#container' }), { audioElement: '#audio' });

        expect(player.volume).toBe(1);

        player.volume = 0.5;

        expect(player.volume).toBe(0.5);
    });

    it('gets and sets the current time of the audio', () => {
        document.body.innerHTML = '<div id="container"><audio id="audio"></audio></div>';

        mockCanvas();

        const player = new Player(new ViewMock([], { container: '#container' }), { audioElement: '#audio' });

        expect(player.currentTime).toBe(0);

        player.currentTime = 1;

        expect(player.currentTime).toBe(1);
    });

    it('gets the duration of the audio', () => {
        document.body.innerHTML = '<div id="container"><audio id="audio"></audio></div>';

        mockCanvas();

        const player = new Player(new ViewMock([], { container: '#container' }), { audioElement: '#audio' });

        expect(player.duration).toBe(NaN);
    });

    it('gets the view instance', () => {
        document.body.innerHTML = '<div id="container"><audio id="audio"></audio></div>';

        mockCanvas();

        const player = new Player(new ViewMock([], { container: '#container' }), { audioElement: '#audio' });

        expect(player.view).toBeInstanceOf(ViewMock);
    });

    it('gets the audio element', () => {
        document.body.innerHTML = '<div id="container"><audio id="audio"></audio></div>';

        mockCanvas();

        const player = new Player(new ViewMock([], { container: '#container' }), { audioElement: '#audio' });

        expect(player.audioElement).toBeInstanceOf(HTMLAudioElement);
    });

    it('updates the view progress when the timeupdate event is fired', () => {
        document.body.innerHTML = '<div id="container"><audio id="audio"></audio></div>';

        const audioElement = document.querySelector<HTMLAudioElement>('#audio');

        if (!audioElement) return;

        Object.defineProperty(ViewMock.prototype, 'progress', {
            // eslint-disable-next-line require-jsdoc, @typescript-eslint/no-empty-function
            set: jest.fn(),
            configurable: true,
        });

        mockCanvas();

        new Player(new ViewMock([], { container: '#container' }), { audioElement: '#audio' });

        const spy = jest.spyOn(ViewMock.prototype, 'progress', 'set');

        audioElement.dispatchEvent(new Event('timeupdate'));

        expect(spy).toHaveBeenCalled();

        spy.mockRestore();
    });

    it('skips to a new playback position when evaluating the on click handler', () => {
        document.body.innerHTML = '<div id="container"><audio id="audio"></audio></div>';

        const canvas = mockCanvas();
        const player = new Player(new ViewMock([], { container: '#container' }), { audioElement: '#audio' });
        const spy = jest.spyOn(player, 'skipTo').mockImplementationOnce(() => player);

        canvas.dispatchEvent(new MouseEvent('click'));

        expect(spy).toHaveBeenCalled();

        spy.mockRestore();
    });

    it('successfuly loads an audio file using the data strategy', async () => {
        document.body.innerHTML = '<div id="container"><audio id="audio"></audio></div>';

        const audioElement = document.querySelector<HTMLAudioElement>('#audio');

        if (!audioElement) return;

        mockCanvas();

        const { mockLoad } = mockAudioElement();
        const player = new Player(new ViewMock([], { container: '#container' }), {
            audioElement: '#audio',
        });

        setTimeout(() => {
            audioElement.dispatchEvent(new Event('canplay'));
        }, 0);

        await expect(player.load('/stubs/sine.wav', new DataStrategy(sine))).resolves.toBe(player);
        expect(mockLoad).toHaveBeenCalled();
    });

    it('successfuly loads an audio file using the JSON strategy', async () => {
        document.body.innerHTML = '<div id="container"><audio id="audio"></audio></div>';

        const audioElement = document.querySelector<HTMLAudioElement>('#audio');

        if (!audioElement) return;

        mockCanvas();

        const { mockLoad } = mockAudioElement();
        const spy = jest.spyOn(utils, 'getJson').mockResolvedValue(sine);
        const player = new Player(new ViewMock([], { container: '#container' }), {
            audioElement: '#audio',
        });

        setTimeout(() => {
            audioElement.dispatchEvent(new Event('canplay'));
        }, 0);

        await expect(player.load('/stubs/sine.wav', new JsonStrategy('/stubs/sine.json'))).resolves.toBe(player);
        expect(mockLoad).toHaveBeenCalled();
        expect(spy).toHaveBeenCalledWith('/stubs/sine.json');

        spy.mockRestore();
    });

    it('successfuly loads an audio file using the Web Audio strategy', async () => {
        document.body.innerHTML = '<div id="container"><audio id="audio"></audio></div>';

        const audioElement = document.querySelector<HTMLAudioElement>('#audio');

        if (!audioElement) return;

        mockCanvas();

        const { mockLoad } = mockAudioElement();
        const spy = jest.spyOn(audio, 'extractAmplitudes').mockResolvedValue(sine);
        const player = new Player(new ViewMock([], { container: '#container' }), {
            audioElement: '#audio',
        });

        setTimeout(() => {
            audioElement.dispatchEvent(new Event('canplay'));
        }, 0);

        await expect(player.load('/stubs/sine.wav', new WebAudioStrategy())).resolves.toBe(player);
        expect(mockLoad).toHaveBeenCalled();
        expect(spy).toHaveBeenCalledWith('/stubs/sine.wav', { points: 800, normalise: true, logarithmic: true });

        spy.mockRestore();
    });

    it('uses the cached data when it exists', async () => {
        document.body.innerHTML = '<div id="container"><audio id="audio"></audio></div>';

        const audioElement = document.querySelector<HTMLAudioElement>('#audio');

        if (!audioElement) return;

        mockCanvas();

        const { mockLoad } = mockAudioElement();
        const spy = jest.spyOn(Storage.prototype, 'getItem');
        const player = new Player(new ViewMock([], { container: '#container' }), {
            audioElement: '#audio',
        });

        for (let i = 0; i < 2; i++) {
            setTimeout(() => {
                audioElement.dispatchEvent(new Event('canplay'));
            }, 0);

            await expect(player.load('/stubs/sine.wav', new JsonStrategy('/stubs/sine.json', true))).resolves.toBe(
                player,
            );
        }

        expect(mockLoad).toHaveBeenCalled();
        expect(spy).toHaveBeenCalledWith('waveplayer:/stubs/sine.json');

        spy.mockRestore();
    });

    it('plays an audio file', async () => {
        document.body.innerHTML = '<div id="container"><audio id="audio"></audio></div>';

        mockCanvas();

        const { mockPlay } = mockAudioElement();
        const player = new Player(new ViewMock([], { container: '#container' }), {
            audioElement: '#audio',
        });

        await expect(player.play()).resolves.toBe(player);
        expect(mockPlay).toHaveBeenCalled();
    });

    it('pauses an audio file', async () => {
        document.body.innerHTML = '<div id="container"><audio id="audio"></audio></div>';

        mockCanvas();

        const { mockPause } = mockAudioElement();
        const player = new Player(new ViewMock([], { container: '#container' }), {
            audioElement: '#audio',
        });

        expect(player.pause()).toBe(player);
        expect(mockPause).toHaveBeenCalled();
    });

    it('skips to a specific position in an audio file', () => {
        document.body.innerHTML = '<div id="container"><audio id="audio"></audio></div>';

        mockCanvas();

        const player = new Player(new ViewMock([], { container: '#container' }), {
            audioElement: '#audio',
        });

        expect(player.skipTo(1)).toBe(player);
    });

    it('checks if audio playback is paused', () => {
        document.body.innerHTML = '<div id="container"><audio id="audio"></audio></div>';

        mockCanvas();

        const player = new Player(new ViewMock([], { container: '#container' }), {
            audioElement: '#audio',
        });

        expect(player.paused()).toBeTruthy();
    });

    it('attaches play and error event handlers on every load', async () => {
        document.body.innerHTML = '<div id="container"><audio id="audio"></audio></div>';

        const audioElement = document.querySelector<HTMLAudioElement>('#audio');

        if (!audioElement) return;

        mockCanvas();

        const { mockLoad } = mockAudioElement();
        const player = new Player(new ViewMock([], { container: '#container' }), {
            audioElement: '#audio',
        });
        const spies = [jest.spyOn(audioElement, 'addEventListener'), jest.spyOn(audioElement, 'removeEventListener')];

        for (let i = 0; i < 2; i++) {
            setTimeout(() => {
                audioElement.dispatchEvent(new Event('canplay'));
            }, 0);

            await expect(player.load('/stubs/sine.wav', new DataStrategy(sine))).resolves.toBe(player);
        }

        expect(mockLoad).toHaveBeenCalledTimes(2);
        expect(spies[0]).toHaveBeenCalledTimes(4);
        expect(spies[1]).toHaveBeenCalledTimes(2);

        spies.forEach((spy) => spy.mockRestore());
    });

    for (const { label, code, constant, error } of [
        {
            label: 'the fetching process was aborted by the user',
            code: 1,
            constant: 'MEDIA_ERR_ABORTED',
            error: 'Fetching process aborted by user.',
        },
        {
            label: 'there was a problem downloading the audio file',
            code: 2,
            constant: 'MEDIA_ERR_NETWORK',
            error: 'There was a problem downloading the audio file.',
        },
        {
            label: 'there was a problem decoding the audio file',
            code: 3,
            constant: 'MEDIA_ERR_DECODE',
            error: 'There was a problem decoding the audio file.',
        },
        {
            label: 'the audio file is not supported',
            code: 4,
            constant: 'MEDIA_ERR_SRC_NOT_SUPPORTED',
            error: 'The audio file is not supported.',
        },
        {
            label: 'an unknown error occurred',
            code: 999,
            constant: 'MEDIA_ERR_UNKNOWN',
            error: 'An unknown error occurred.',
        },
    ]) {
        it(`throws if ${label}`, async () => {
            document.body.innerHTML = '<div id="container"><audio id="audio"></audio></div>';

            const audioElement = document.querySelector<HTMLAudioElement>('#audio');

            if (!audioElement) return;

            mockCanvas();

            const { mockLoad } = mockAudioElement();
            const player = new Player(new ViewMock([], { container: '#container' }), {
                audioElement: '#audio',
            });

            Object.defineProperty(audioElement, 'error', {
                value: { code, [constant]: code },
                configurable: true,
            });

            setTimeout(() => {
                audioElement.dispatchEvent(new Event('error'));
            }, 0);

            await expect(player.load('/stubs/sine.wav', new DataStrategy(sine))).rejects.toEqual(new Error(error));
            expect(mockLoad).toHaveBeenCalled();
        });
    }

    it('removes the event handlers and destroys the view instance when destroying a player instance', async () => {
        document.body.innerHTML = '<div id="container"></div>';

        const container = document.querySelector<HTMLDivElement>('#container');

        if (!container) return;

        const { mockLoad, mockPause } = mockAudioElement();

        mockCanvas();
        mockContainer(container);

        const spy = jest.spyOn(ViewMock.prototype, 'destroy');
        const player = new Player(new ViewMock([], { container: '#container' }));
        const audioElement = document.querySelector<HTMLAudioElement>('audio');

        if (!audioElement) return;

        setTimeout(() => {
            audioElement.dispatchEvent(new Event('canplay'));
        }, 0);

        await expect(player.load('/stubs/sine.wav', new DataStrategy(sine))).resolves.toBe(player);
        expect(player.destroy()).toBeUndefined();
        expect(mockLoad).toHaveBeenCalled();
        expect(mockPause).toHaveBeenCalled();
        expect(spy).toHaveBeenCalled();

        spy.mockRestore();
    });
});
