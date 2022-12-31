import Player, { DataStrategy } from '../src/Player';
import Playlist from '../src/Playlist';

jest.mock('../src/Player');

const PlayerMock = Player as unknown as jest.Mock<Player>;

beforeEach(() => {
    PlayerMock.mockClear();
});

afterEach(() => {
    jest.resetAllMocks();
    jest.resetModules();
});

/**
 * Explicitly define a getter on the player mock prototype.
 *
 * Necessary because of Necessary because of https://github.com/facebook/jest/issues/9675
 *
 * @param {string} property
 * @returns {void}
 */
const defineGetter = (property: string) => {
    Object.defineProperty(PlayerMock.prototype, property, {
        // eslint-disable-next-line require-jsdoc, @typescript-eslint/no-empty-function
        get() {},
        configurable: true,
    });
};

describe('Playlist', () => {
    it('creates a new instance', () => {
        defineGetter('audioElement');

        const spy = jest
            .spyOn(PlayerMock.prototype, 'audioElement', 'get')
            .mockReturnValue(document.createElement('audio'));
        const player = new Playlist(new PlayerMock(), [{ url: '/stubs/sine.wav', strategy: new DataStrategy([]) }]);

        expect(player).toBeInstanceOf(Playlist);
        expect(spy).toHaveBeenCalled();

        spy.mockRestore();
    });

    it('throws if the playlist is empty', () => {
        expect(() => {
            new Playlist(new PlayerMock(), []);
        }).toThrow('A playlist needs to contain at least one track.');
    });
});
