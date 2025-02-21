import Player from '../src/Player';
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
 * Explicitly mock the getter for the audio element on the player mock prototype.
 *
 * Necessary because of Necessary because of https://github.com/facebook/jest/issues/9675
 *
 * @returns {HTMLAudioElement}
 */
const mockAudioElement = (): HTMLAudioElement => {
	const audioElement = document.createElement('audio');

	Object.defineProperty(Player.prototype, 'audioElement', {
		get: jest.fn(() => audioElement),
		configurable: true,
	});

	return audioElement;
};

/**
 * Explicitly mock the getter for the paused attribute on the player mock prototype.
 *
 * @param {boolean} paused
 * @returns {void}
 */
const mockPaused = (paused: boolean): void => {
	Object.defineProperty(Player.prototype, 'paused', {
		get: jest.fn(() => paused),
		configurable: true,
	});
};

describe('Playlist', () => {
	it('creates a new instance', () => {
		mockAudioElement();

		const playlist = new Playlist(new PlayerMock(), [
			{ url: '/stubs/sine.wav', strategy: { type: 'data', data: [] } },
		]);

		expect(playlist).toBeInstanceOf(Playlist);
	});

	it('throws if the playlist is empty', () => {
		expect(() => {
			new Playlist(new PlayerMock(), []);
		}).toThrow('A playlist needs to contain at least one track.');
	});

	it('starts playback of the next track when the current track ends', () => {
		const audioElement = mockAudioElement();
		const playlist = new Playlist(new PlayerMock(), [
			{ url: '/stubs/sine.wav', strategy: { type: 'data', data: [] } },
		]);
		const spy = jest.spyOn(playlist, 'next');

		audioElement.dispatchEvent(new Event('ended'));

		expect(spy).toHaveBeenCalled();

		spy.mockRestore();
	});

	it('gets and sets the force play flag of the playlist', () => {
		mockAudioElement();

		const playlist = new Playlist(new PlayerMock(), [
			{ url: '/stubs/sine.wav', strategy: { type: 'data', data: [] } },
		]);

		expect(playlist.forcePlay).toBeTruthy();

		playlist.forcePlay = false;

		expect(playlist.forcePlay).toBeFalsy();
	});

	it('gets the player instance', () => {
		mockAudioElement();

		const playlist = new Playlist(new PlayerMock(), [
			{ url: '/stubs/sine.wav', strategy: { type: 'data', data: [] } },
		]);

		expect(playlist.player).toBeInstanceOf(PlayerMock);
	});

	it('gets the index of the currently selected track', () => {
		mockAudioElement();

		const playlist = new Playlist(new PlayerMock(), [
			{ url: '/stubs/sine.wav', strategy: { type: 'data', data: [] } },
		]);

		expect(playlist.current).toBe(0);
	});

	it('gets the flag that indicates whether the playlist has finished.', () => {
		mockAudioElement();

		const playlist = new Playlist(new PlayerMock(), [
			{ url: '/stubs/sine.wav', strategy: { type: 'data', data: [] } },
		]);

		expect(playlist.ended).toBeFalsy();
	});

	it('starts playback of the playlist', async () => {
		mockAudioElement();
		mockPaused(true);

		const playlist = new Playlist(new PlayerMock(), [
			{ url: '/stubs/sine.wav', strategy: { type: 'data', data: [] } },
		]);

		await expect(playlist.play()).resolves.toBe(playlist);
		expect(PlayerMock.mock.instances[0].paused).toBeTruthy();
		expect(PlayerMock.mock.instances[0].pause).toHaveBeenCalled();
		expect(PlayerMock.mock.instances[0].load).toHaveBeenCalled();
		expect(PlayerMock.mock.instances[0].play).toHaveBeenCalled();
	});

	it('pauses playback of the playlist', () => {
		mockAudioElement();
		mockPaused(false);

		const playlist = new Playlist(new PlayerMock(), [
			{ url: '/stubs/sine.wav', strategy: { type: 'data', data: [] } },
		]);

		expect(playlist.pause()).toBe(playlist);
	});

	it('resets the playlist', async () => {
		mockAudioElement();

		const playlist = new Playlist(new PlayerMock(), [
			{ url: '/stubs/sine.wav', strategy: { type: 'data', data: [] } },
		]);

		await expect(playlist.reset()).resolves.toBe(playlist);
	});

	it('prepares the playlist', async () => {
		mockAudioElement();

		const playlist = new Playlist(new PlayerMock(), [
			{ url: '/stubs/sine.wav', strategy: { type: 'data', data: [] } },
		]);

		await expect(playlist.prepare()).resolves.toBe(playlist);
	});

	it('selects the next track in the playlist', async () => {
		mockAudioElement();

		const playlist = new Playlist(new PlayerMock(), [
			{ url: '/stubs/sine.wav', strategy: { type: 'data', data: [] } },
			{ url: '/stubs/noise.wav', strategy: { type: 'data', data: [] } },
		]);

		await expect(playlist.next()).resolves.toBe(playlist);
	});

	it('selects the previous track in the playlist', async () => {
		mockAudioElement();

		const playlist = new Playlist(new PlayerMock(), [
			{ url: '/stubs/sine.wav', strategy: { type: 'data', data: [] } },
			{ url: '/stubs/noise.wav', strategy: { type: 'data', data: [] } },
		]);

		await playlist.next();

		await expect(playlist.previous()).resolves.toBe(playlist);
	});

	it('selects a track in the playlist', async () => {
		mockAudioElement();

		const playlist = new Playlist(new PlayerMock(), [
			{ url: '/stubs/sine.wav', strategy: { type: 'data', data: [] } },
			{ url: '/stubs/noise.wav', strategy: { type: 'data', data: [] } },
		]);

		await expect(playlist.select(1)).resolves.toBe(playlist);
	});

	it('removes the event handlers and destroys the player instance when destroying a playlist instance', async () => {
		const audioElement = mockAudioElement();

		const spies = [
			jest.spyOn(PlayerMock.prototype, 'destroy'),
			jest.spyOn(audioElement, 'removeEventListener'),
		];
		const playlist = new Playlist(new PlayerMock(), [
			{ url: '/stubs/sine.wav', strategy: { type: 'data', data: [] } },
		]);

		expect(playlist.destroy()).toBeUndefined();

		for (const spy of spies) {
			expect(spy).toHaveBeenCalled();

			spy.mockRestore();
		}
	});
});
