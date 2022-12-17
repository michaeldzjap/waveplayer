import '@testing-library/jest-dom';

import WavePlayer from '../src/WavePlayer';
import WaveView from '../src/WaveView';

jest.mock('../src/WaveView');

const WaveViewMock = WaveView as unknown as jest.Mock<WaveView>;

beforeEach(() => {
    WaveViewMock.mockClear();
});

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
});
