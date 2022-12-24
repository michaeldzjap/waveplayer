import '@testing-library/jest-dom';

import * as audio from '../src/audio';
import * as utils from '../src/utils';
import WavePlayer, { DataStrategy, JsonStrategy, WebAudioStrategy } from '../src/WavePlayer';
import WaveView from '../src/WaveView';
import noise from './stubs/noise';
import sine from './stubs/sine';

jest.mock('../src/WaveView');

const WaveViewMock = WaveView as unknown as jest.Mock<WaveView>;

beforeEach(() => {
    WaveViewMock.mockClear();
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

describe('WavePlayer', () => {
    it('creates a new instance when referencing an existing audio element', () => {
        document.body.innerHTML = '<div id="container"><audio id="audio"></audio></div>';

        const player = new WavePlayer(new WaveViewMock([], { container: '#container' }), { audioElement: '#audio' });

        expect(player).toBeInstanceOf(WavePlayer);
        expect(WaveViewMock).toHaveBeenCalled();
    });

    it('creates a new instance for an existing audio element', () => {
        document.body.innerHTML = '<div id="container"><audio id="audio"></audio></div>';

        const audioElement = document.querySelector<HTMLAudioElement>('#audio');

        if (!audioElement) return;

        const player = new WavePlayer(new WaveViewMock([], { container: '#container' }), { audioElement });

        expect(player).toBeInstanceOf(WavePlayer);
        expect(WaveViewMock).toHaveBeenCalled();
    });

    it('throws an error for a non existing audio element', () => {
        expect(() => {
            document.body.innerHTML = '<div id="container"></div>';

            return new WavePlayer(new WaveViewMock([], { container: '#container' }), { audioElement: 'foo' });
        }).toThrow('Audio element could not be located.');
    });

    it('creates a new audio element when one is not provided explicitly', () => {
        document.body.innerHTML = '<div id="container"></div>';

        const viewMock = new WaveViewMock([], { container: '#container' });

        // Necessary because of https://github.com/facebook/jest/issues/9675
        Object.defineProperty(viewMock, 'container', {
            // eslint-disable-next-line require-jsdoc, @typescript-eslint/no-empty-function
            get() {},
            configurable: true,
        });

        const container = document.querySelector<HTMLDivElement>('#container');

        if (!container) return;

        const spy = jest.spyOn(viewMock, 'container', 'get').mockReturnValue(container);

        const player = new WavePlayer(viewMock);
        const audioElement = document.querySelector<HTMLAudioElement>('#audio');

        if (!audioElement) return;

        expect(player).toBeInstanceOf(WavePlayer);
        expect(audioElement).toBeInstanceOf(HTMLAudioElement);
        expect(WaveViewMock).toHaveBeenCalled();
        expect(spy).toHaveBeenCalled();
    });

    it('gets and sets the audio volume', () => {
        document.body.innerHTML = '<div id="container"><audio id="audio"></audio></div>';

        const player = new WavePlayer(new WaveViewMock([], { container: '#container' }), { audioElement: '#audio' });

        expect(player.volume).toBe(1);

        player.volume = 0.5;

        expect(player.volume).toBe(0.5);
    });

    it('gets and sets the current time of the audio', () => {
        document.body.innerHTML = '<div id="container"><audio id="audio"></audio></div>';

        const player = new WavePlayer(new WaveViewMock([], { container: '#container' }), { audioElement: '#audio' });

        expect(player.currentTime).toBe(0);

        player.currentTime = 1;

        expect(player.currentTime).toBe(1);
    });

    it('gets the duration of the audio', () => {
        document.body.innerHTML = '<div id="container"><audio id="audio"></audio></div>';

        const player = new WavePlayer(new WaveViewMock([], { container: '#container' }), { audioElement: '#audio' });

        expect(player.duration).toBe(NaN);
    });

    it('gets the wave view instance', () => {
        document.body.innerHTML = '<div id="container"><audio id="audio"></audio></div>';

        const player = new WavePlayer(new WaveViewMock([], { container: '#container' }), { audioElement: '#audio' });

        expect(player.waveView).toBeInstanceOf(WaveViewMock);
    });

    it('updates the wave view progress when the timeupdate event is fired', () => {
        document.body.innerHTML = '<div id="container"><audio id="audio"></audio></div>';

        const viewMock = new WaveViewMock([], { container: '#container' });

        // Necessary because of https://github.com/facebook/jest/issues/9675
        Object.defineProperty(viewMock, 'progress', {
            // eslint-disable-next-line require-jsdoc, @typescript-eslint/no-empty-function
            set() {},
            configurable: true,
        });

        const spy = jest.spyOn(viewMock, 'progress', 'set');

        new WavePlayer(viewMock, { audioElement: '#audio' });

        const audioElement = document.querySelector<HTMLAudioElement>('#audio');

        if (!audioElement) return;

        audioElement.dispatchEvent(new Event('timeupdate'));

        expect(spy).toHaveBeenCalled();
    });

    it('skips to a new playback position when evaluating the on click handler', () => {
        document.body.innerHTML = '<div id="container"><audio id="audio"></audio></div>';

        const viewMock = new WaveViewMock([], { container: '#container' });
        const player = new WavePlayer(viewMock, { audioElement: '#audio' });

        const spy = jest.spyOn(player, 'skipTo').mockImplementationOnce((seconds: number) => player);

        if (viewMock.onClick) {
            viewMock.onClick(new MouseEvent('click'));
        }

        expect(spy).toHaveBeenCalled();
    });

    it('successfuly loads an audio file using the data strategy', async () => {
        const { mockLoad } = mockAudioElement();

        document.body.innerHTML = '<div id="container"><audio id="audio"></audio></div>';

        const player = new WavePlayer(new WaveViewMock([], { container: '#container' }), {
            audioElement: '#audio',
        });
        const audioElement = document.querySelector<HTMLAudioElement>('#audio');

        if (!audioElement) return;

        setTimeout(() => {
            audioElement.dispatchEvent(new Event('canplay'));
        }, 0);

        await expect(player.load('/stubs/sine.wav', new DataStrategy(sine))).resolves.toBe(player);
        expect(mockLoad).toHaveBeenCalled();
    });

    it('successfuly loads an audio file using the JSON strategy', async () => {
        const { mockLoad } = mockAudioElement();

        document.body.innerHTML = '<div id="container"><audio id="audio"></audio></div>';

        const player = new WavePlayer(new WaveViewMock([], { container: '#container' }), {
            audioElement: '#audio',
        });
        const audioElement = document.querySelector<HTMLAudioElement>('#audio');

        if (!audioElement) return;

        const spy = jest.spyOn(utils, 'getJson').mockResolvedValue(sine);

        setTimeout(() => {
            audioElement.dispatchEvent(new Event('canplay'));
        }, 0);

        await expect(player.load('/stubs/sine.wav', new JsonStrategy('/stubs/sine.json'))).resolves.toBe(player);
        expect(mockLoad).toHaveBeenCalled();
        expect(spy).toHaveBeenCalledWith('/stubs/sine.json');

        spy.mockRestore();
    });

    it('successfuly loads an audio file using the Web Audio strategy', async () => {
        const { mockLoad } = mockAudioElement();

        document.body.innerHTML = '<div id="container"><audio id="audio"></audio></div>';

        const player = new WavePlayer(new WaveViewMock([], { container: '#container' }), {
            audioElement: '#audio',
        });
        const audioElement = document.querySelector<HTMLAudioElement>('#audio');

        if (!audioElement) return;

        const spy = jest.spyOn(audio, 'extractAmplitudes').mockResolvedValue(sine);

        setTimeout(() => {
            audioElement.dispatchEvent(new Event('canplay'));
        }, 0);

        await expect(player.load('/stubs/sine.wav', new WebAudioStrategy())).resolves.toBe(player);
        expect(mockLoad).toHaveBeenCalled();
        expect(spy).toHaveBeenCalledWith('/stubs/sine.wav', { points: 800, normalise: true, logarithmic: false });

        spy.mockRestore();
    });

    it('uses the cached data when it exists', async () => {
        const { mockLoad } = mockAudioElement();

        document.body.innerHTML = '<div id="container"><audio id="audio"></audio></div>';

        const player = new WavePlayer(new WaveViewMock([], { container: '#container' }), {
            audioElement: '#audio',
        });
        const audioElement = document.querySelector<HTMLAudioElement>('#audio');

        if (!audioElement) return;

        const spy = jest.spyOn(Storage.prototype, 'getItem');

        setTimeout(() => {
            audioElement.dispatchEvent(new Event('canplay'));
        }, 0);

        await expect(player.load('/stubs/sine.wav', new JsonStrategy('/stubs/sine.json', true))).resolves.toBe(player);
        await expect(player.load('/stubs/sine.wav', new JsonStrategy('/stubs/sine.json', true))).resolves.toBe(player);
        expect(mockLoad).toHaveBeenCalled();
        expect(spy).toHaveBeenCalledWith('waveplayer:/stubs/sine.json');

        spy.mockRestore();
    });

    it('plays an audio file', async () => {
        const { mockPlay } = mockAudioElement();

        document.body.innerHTML = '<div id="container"><audio id="audio"></audio></div>';

        const player = new WavePlayer(new WaveViewMock([], { container: '#container' }), {
            audioElement: '#audio',
        });
        const audioElement = document.querySelector<HTMLAudioElement>('#audio');

        if (!audioElement) return;

        player.play();

        expect(mockPlay).toHaveBeenCalled();
    });

    it('pauses an audio file', async () => {
        const { mockPause } = mockAudioElement();

        document.body.innerHTML = '<div id="container"><audio id="audio"></audio></div>';

        const player = new WavePlayer(new WaveViewMock([], { container: '#container' }), {
            audioElement: '#audio',
        });
        const audioElement = document.querySelector<HTMLAudioElement>('#audio');

        if (!audioElement) return;

        player.pause();

        expect(mockPause).toHaveBeenCalled();
    });

    it('attaches play and error event handlers once', async () => {
        const { mockLoad } = mockAudioElement();

        document.body.innerHTML = '<div id="container"><audio id="audio"></audio></div>';

        const player = new WavePlayer(new WaveViewMock([], { container: '#container' }), {
            audioElement: '#audio',
        });
        const audioElement = document.querySelector<HTMLAudioElement>('#audio');

        if (!audioElement) return;

        const spy = jest.spyOn(audioElement, 'addEventListener');

        setTimeout(() => {
            audioElement.dispatchEvent(new Event('canplay'));
        }, 0);

        await expect(player.load('/stubs/sine.wav', new DataStrategy(sine))).resolves.toBe(player);
        await expect(player.load('/stubs/noise.wav', new DataStrategy(noise))).resolves.toBe(player);
        expect(mockLoad).toHaveBeenCalledTimes(2);
        expect(spy).toHaveBeenCalledTimes(2);

        spy.mockRestore();
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
            const { mockLoad } = mockAudioElement();

            document.body.innerHTML = '<div id="container"><audio id="audio"></audio></div>';

            const player = new WavePlayer(new WaveViewMock([], { container: '#container' }), {
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
        });
    }
});
