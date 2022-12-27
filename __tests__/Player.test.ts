import '@testing-library/jest-dom';

import * as audio from '../src/audio';
import * as utils from '../src/utils';
import Player, { DataStrategy, JsonStrategy, WebAudioStrategy } from '../src/Player';
import View from '../src/View';
import noise from './stubs/noise';
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
 * Explicitly define a getter on the view mock prototype.
 *
 * Necessary because of Necessary because of https://github.com/facebook/jest/issues/9675
 *
 * @param {string} property
 * @returns {void}
 */
const defineGetter = (property: string) => {
    Object.defineProperty(ViewMock.prototype, property, {
        // eslint-disable-next-line require-jsdoc, @typescript-eslint/no-empty-function
        get() {},
        configurable: true,
    });
};

/**
 * Explicitly define a setter on the view mock prototype.
 *
 * Necessary because of Necessary because of https://github.com/facebook/jest/issues/9675
 *
 * @param {string} property
 * @returns {void}
 */
const defineSetter = (property: string) => {
    Object.defineProperty(ViewMock.prototype, property, {
        // eslint-disable-next-line require-jsdoc, @typescript-eslint/no-empty-function
        set() {},
        configurable: true,
    });
};

describe('Player', () => {
    it('creates a new instance when referencing an existing audio element', () => {
        defineGetter('canvas');

        document.body.innerHTML = '<div id="container"><audio id="audio"></audio></div>';

        const spy = jest.spyOn(ViewMock.prototype, 'canvas', 'get').mockReturnValue(document.createElement('canvas'));
        const player = new Player(new ViewMock([], { container: '#container' }), { audioElement: '#audio' });

        expect(player).toBeInstanceOf(Player);
        expect(ViewMock).toHaveBeenCalled();
        expect(spy).toHaveBeenCalled();

        spy.mockRestore();
    });

    it('creates a new instance for an existing audio element', () => {
        defineGetter('canvas');

        document.body.innerHTML = '<div id="container"><audio id="audio"></audio></div>';

        const audioElement = document.querySelector<HTMLAudioElement>('#audio');

        if (!audioElement) return;

        const spy = jest.spyOn(ViewMock.prototype, 'canvas', 'get').mockReturnValue(document.createElement('canvas'));
        const player = new Player(new ViewMock([], { container: '#container' }), { audioElement });

        expect(player).toBeInstanceOf(Player);
        expect(ViewMock).toHaveBeenCalled();
        expect(spy).toHaveBeenCalled();

        spy.mockRestore();
    });

    it('throws an error for a non existing audio element', () => {
        expect(() => {
            document.body.innerHTML = '<div id="container"></div>';

            return new Player(new ViewMock([], { container: '#container' }), { audioElement: 'foo' });
        }).toThrow('Audio element could not be located.');
    });

    it('creates a new audio element when one is not provided explicitly', () => {
        ['container', 'canvas'].forEach((property: string) => defineGetter(property));

        document.body.innerHTML = '<div id="container"></div>';

        const container = document.querySelector<HTMLDivElement>('#container');

        if (!container) return;

        const spies = [
            jest.spyOn(ViewMock.prototype, 'container', 'get').mockReturnValue(container),
            jest.spyOn(ViewMock.prototype, 'canvas', 'get').mockReturnValue(document.createElement('canvas')),
        ];

        const player = new Player(new ViewMock([], { container: '#container' }));
        const audioElement = document.querySelector<HTMLAudioElement>('#audio');

        if (!audioElement) return;

        expect(player).toBeInstanceOf(Player);
        expect(audioElement).toBeInstanceOf(HTMLAudioElement);
        expect(ViewMock).toHaveBeenCalled();

        spies.forEach((spy) => {
            expect(spy).toHaveBeenCalled();

            spy.mockRestore();
        });
    });

    it('gets and sets the audio volume', () => {
        defineGetter('canvas');

        document.body.innerHTML = '<div id="container"><audio id="audio"></audio></div>';

        const spy = jest.spyOn(ViewMock.prototype, 'canvas', 'get').mockReturnValue(document.createElement('canvas'));
        const player = new Player(new ViewMock([], { container: '#container' }), { audioElement: '#audio' });

        expect(player.volume).toBe(1);

        player.volume = 0.5;

        expect(player.volume).toBe(0.5);
        expect(spy).toHaveBeenCalled();

        spy.mockRestore();
    });

    it('gets and sets the current time of the audio', () => {
        defineGetter('canvas');

        document.body.innerHTML = '<div id="container"><audio id="audio"></audio></div>';

        const spy = jest.spyOn(ViewMock.prototype, 'canvas', 'get').mockReturnValue(document.createElement('canvas'));
        const player = new Player(new ViewMock([], { container: '#container' }), { audioElement: '#audio' });

        expect(player.currentTime).toBe(0);

        player.currentTime = 1;

        expect(player.currentTime).toBe(1);
        expect(spy).toHaveBeenCalled();

        spy.mockRestore();
    });

    it('gets the duration of the audio', () => {
        defineGetter('canvas');

        document.body.innerHTML = '<div id="container"><audio id="audio"></audio></div>';

        const spy = jest.spyOn(ViewMock.prototype, 'canvas', 'get').mockReturnValue(document.createElement('canvas'));
        const player = new Player(new ViewMock([], { container: '#container' }), { audioElement: '#audio' });

        expect(player.duration).toBe(NaN);
        expect(spy).toHaveBeenCalled();

        spy.mockRestore();
    });

    it('gets the view instance', () => {
        defineGetter('canvas');

        document.body.innerHTML = '<div id="container"><audio id="audio"></audio></div>';

        const spy = jest.spyOn(ViewMock.prototype, 'canvas', 'get').mockReturnValue(document.createElement('canvas'));
        const player = new Player(new ViewMock([], { container: '#container' }), { audioElement: '#audio' });

        expect(player.view).toBeInstanceOf(ViewMock);
        expect(spy).toHaveBeenCalled();

        spy.mockRestore();
    });

    it('updates the view progress when the timeupdate event is fired', () => {
        defineGetter('canvas');
        defineSetter('progress');

        document.body.innerHTML = '<div id="container"><audio id="audio"></audio></div>';

        const spies = [
            jest.spyOn(ViewMock.prototype, 'canvas', 'get').mockReturnValue(document.createElement('canvas')),
            jest.spyOn(ViewMock.prototype, 'progress', 'set'),
        ];

        new Player(new ViewMock([], { container: '#container' }), { audioElement: '#audio' });

        const audioElement = document.querySelector<HTMLAudioElement>('#audio');

        if (!audioElement) return;

        audioElement.dispatchEvent(new Event('timeupdate'));

        spies.forEach((spy) => {
            expect(spy).toHaveBeenCalled();

            spy.mockRestore();
        });
    });

    it('skips to a new playback position when evaluating the on click handler', () => {
        defineGetter('canvas');

        document.body.innerHTML = '<div id="container"><audio id="audio"></audio></div>';

        const canvas = document.createElement('canvas');
        const spies = [
            jest.spyOn(ViewMock.prototype, 'canvas', 'get').mockReturnValue(canvas),
            jest.spyOn(canvas, 'addEventListener'),
        ];
        const player = new Player(new ViewMock([], { container: '#container' }), { audioElement: '#audio' });
        const spy = jest.spyOn(player, 'skipTo').mockImplementationOnce(() => player);

        canvas.dispatchEvent(new MouseEvent('click'));

        [...spies, spy].forEach((spy) => {
            expect(spy).toHaveBeenCalled();

            spy.mockRestore();
        });
    });

    it('successfuly loads an audio file using the data strategy', async () => {
        defineGetter('canvas');

        const { mockLoad } = mockAudioElement();

        document.body.innerHTML = '<div id="container"><audio id="audio"></audio></div>';

        const spy = jest.spyOn(ViewMock.prototype, 'canvas', 'get').mockReturnValue(document.createElement('canvas'));
        const player = new Player(new ViewMock([], { container: '#container' }), {
            audioElement: '#audio',
        });
        const audioElement = document.querySelector<HTMLAudioElement>('#audio');

        if (!audioElement) return;

        setTimeout(() => {
            audioElement.dispatchEvent(new Event('canplay'));
        }, 0);

        await expect(player.load('/stubs/sine.wav', new DataStrategy(sine))).resolves.toBe(player);
        expect(mockLoad).toHaveBeenCalled();
        expect(spy).toHaveBeenCalled();

        spy.mockRestore();
    });

    it('successfuly loads an audio file using the JSON strategy', async () => {
        defineGetter('canvas');

        const { mockLoad } = mockAudioElement();

        document.body.innerHTML = '<div id="container"><audio id="audio"></audio></div>';

        const spies = [
            jest.spyOn(ViewMock.prototype, 'canvas', 'get').mockReturnValue(document.createElement('canvas')),
            jest.spyOn(utils, 'getJson').mockResolvedValue(sine),
        ];
        const player = new Player(new ViewMock([], { container: '#container' }), {
            audioElement: '#audio',
        });
        const audioElement = document.querySelector<HTMLAudioElement>('#audio');

        if (!audioElement) return;

        setTimeout(() => {
            audioElement.dispatchEvent(new Event('canplay'));
        }, 0);

        await expect(player.load('/stubs/sine.wav', new JsonStrategy('/stubs/sine.json'))).resolves.toBe(player);
        expect(mockLoad).toHaveBeenCalled();
        expect(spies[0]).toHaveBeenCalled();
        expect(spies[1]).toHaveBeenCalledWith('/stubs/sine.json');

        spies.forEach((spy) => spy.mockRestore());
    });

    it('successfuly loads an audio file using the Web Audio strategy', async () => {
        defineGetter('canvas');

        const { mockLoad } = mockAudioElement();

        document.body.innerHTML = '<div id="container"><audio id="audio"></audio></div>';

        const spies = [
            jest.spyOn(ViewMock.prototype, 'canvas', 'get').mockReturnValue(document.createElement('canvas')),
            jest.spyOn(audio, 'extractAmplitudes').mockResolvedValue(sine),
        ];
        const player = new Player(new ViewMock([], { container: '#container' }), {
            audioElement: '#audio',
        });
        const audioElement = document.querySelector<HTMLAudioElement>('#audio');

        if (!audioElement) return;

        setTimeout(() => {
            audioElement.dispatchEvent(new Event('canplay'));
        }, 0);

        await expect(player.load('/stubs/sine.wav', new WebAudioStrategy())).resolves.toBe(player);
        expect(mockLoad).toHaveBeenCalled();
        expect(spies[0]).toHaveBeenCalled();
        expect(spies[1]).toHaveBeenCalledWith('/stubs/sine.wav', { points: 800, normalise: true, logarithmic: true });

        spies.forEach((spy) => spy.mockRestore());
    });

    it('uses the cached data when it exists', async () => {
        defineGetter('canvas');

        const { mockLoad } = mockAudioElement();

        document.body.innerHTML = '<div id="container"><audio id="audio"></audio></div>';

        const spies = [
            jest.spyOn(ViewMock.prototype, 'canvas', 'get').mockReturnValue(document.createElement('canvas')),
            jest.spyOn(Storage.prototype, 'getItem'),
        ];

        const player = new Player(new ViewMock([], { container: '#container' }), {
            audioElement: '#audio',
        });
        const audioElement = document.querySelector<HTMLAudioElement>('#audio');

        if (!audioElement) return;

        setTimeout(() => {
            audioElement.dispatchEvent(new Event('canplay'));
        }, 0);

        await expect(player.load('/stubs/sine.wav', new JsonStrategy('/stubs/sine.json', true))).resolves.toBe(player);
        await expect(player.load('/stubs/sine.wav', new JsonStrategy('/stubs/sine.json', true))).resolves.toBe(player);
        expect(mockLoad).toHaveBeenCalled();
        expect(spies[0]).toHaveBeenCalled();
        expect(spies[1]).toHaveBeenCalledWith('waveplayer:/stubs/sine.json');

        spies.forEach((spy) => spy.mockRestore());
    });

    it('plays an audio file', async () => {
        defineGetter('canvas');

        const { mockPlay } = mockAudioElement();

        document.body.innerHTML = '<div id="container"><audio id="audio"></audio></div>';

        const spy = jest.spyOn(ViewMock.prototype, 'canvas', 'get').mockReturnValue(document.createElement('canvas'));
        const player = new Player(new ViewMock([], { container: '#container' }), {
            audioElement: '#audio',
        });

        await expect(player.play()).resolves.toBe(player);
        expect(mockPlay).toHaveBeenCalled();
        expect(spy).toHaveBeenCalled();

        spy.mockRestore();
    });

    it('pauses an audio file', async () => {
        defineGetter('canvas');

        const { mockPause } = mockAudioElement();

        document.body.innerHTML = '<div id="container"><audio id="audio"></audio></div>';

        const spy = jest.spyOn(ViewMock.prototype, 'canvas', 'get').mockReturnValue(document.createElement('canvas'));
        const player = new Player(new ViewMock([], { container: '#container' }), {
            audioElement: '#audio',
        });

        expect(player.pause()).toBe(player);
        expect(mockPause).toHaveBeenCalled();
        expect(spy).toHaveBeenCalled();

        spy.mockRestore();
    });

    it('skips to a specific position in an audio file', () => {
        defineGetter('canvas');

        document.body.innerHTML = '<div id="container"><audio id="audio"></audio></div>';

        const spy = jest.spyOn(ViewMock.prototype, 'canvas', 'get').mockReturnValue(document.createElement('canvas'));
        const player = new Player(new ViewMock([], { container: '#container' }), {
            audioElement: '#audio',
        });

        expect(player.skipTo(1)).toBe(player);
        expect(spy).toHaveBeenCalled();

        spy.mockRestore();
    });

    it('checks if audio playback is paused', () => {
        defineGetter('canvas');

        document.body.innerHTML = '<div id="container"><audio id="audio"></audio></div>';

        const spy = jest.spyOn(ViewMock.prototype, 'canvas', 'get').mockReturnValue(document.createElement('canvas'));
        const player = new Player(new ViewMock([], { container: '#container' }), {
            audioElement: '#audio',
        });

        expect(player.paused()).toBeTruthy();
        expect(spy).toHaveBeenCalled();

        spy.mockRestore();
    });

    it('attaches play and error event handlers once', async () => {
        defineGetter('canvas');

        const { mockLoad } = mockAudioElement();

        document.body.innerHTML = '<div id="container"><audio id="audio"></audio></div>';

        const viewSpy = jest
            .spyOn(ViewMock.prototype, 'canvas', 'get')
            .mockReturnValue(document.createElement('canvas'));
        const player = new Player(new ViewMock([], { container: '#container' }), {
            audioElement: '#audio',
        });
        const audioElement = document.querySelector<HTMLAudioElement>('#audio');

        if (!audioElement) return;

        const audioSpy = jest.spyOn(audioElement, 'addEventListener');

        setTimeout(() => {
            audioElement.dispatchEvent(new Event('canplay'));
        }, 0);

        await expect(player.load('/stubs/sine.wav', new DataStrategy(sine))).resolves.toBe(player);
        await expect(player.load('/stubs/noise.wav', new DataStrategy(noise))).resolves.toBe(player);
        expect(mockLoad).toHaveBeenCalledTimes(2);
        expect(audioSpy).toHaveBeenCalledTimes(2);
        expect(viewSpy).toHaveBeenCalled();

        [audioSpy, viewSpy].forEach((spy) => spy.mockRestore());
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
            defineGetter('canvas');

            const { mockLoad } = mockAudioElement();

            document.body.innerHTML = '<div id="container"><audio id="audio"></audio></div>';

            const spy = jest
                .spyOn(ViewMock.prototype, 'canvas', 'get')
                .mockReturnValue(document.createElement('canvas'));
            const player = new Player(new ViewMock([], { container: '#container' }), {
                audioElement: '#audio',
            });
            const audioElement = document.querySelector<HTMLAudioElement>('#audio');

            if (!audioElement) return;

            Object.defineProperty(audioElement, 'error', {
                value: { code, [constant]: code },
                configurable: true,
            });

            setTimeout(() => {
                audioElement.dispatchEvent(new Event('error'));
            }, 0);

            await expect(player.load('/stubs/sine.wav', new DataStrategy(sine))).rejects.toEqual(new Error(error));
            expect(mockLoad).toHaveBeenCalled();
            expect(spy).toHaveBeenCalled();

            spy.mockRestore();
        });
    }

    it('removes the event handlers and destroys the view instance when destroying a player instance', async () => {
        defineGetter('canvas');
        defineGetter('container');

        const { mockLoad, mockPause } = mockAudioElement();

        document.body.innerHTML = '<div id="container"></div>';

        const container = document.querySelector<HTMLDivElement>('#container');

        if (!container) return;

        const spies = [
            jest.spyOn(ViewMock.prototype, 'canvas', 'get').mockReturnValue(document.createElement('canvas')),
            jest.spyOn(ViewMock.prototype, 'container', 'get').mockReturnValue(container),
            jest.spyOn(ViewMock.prototype, 'destroy'),
        ];
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

        spies.forEach((spy) => {
            expect(spy).toHaveBeenCalled();

            spy.mockRestore();
        });
    });
});
