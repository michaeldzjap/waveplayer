import { Factory, Player, Playlist } from '../src/index';

describe('index', () => {
    describe('Factory', () => {
        it('creates a new player instance', () => {
            document.body.innerHTML = '<div id="container"><audio id="audio"></audio></div>';

            const player = Factory.createPlayer({ container: '#container', audioElement: '#audio' });

            expect(player).toBeInstanceOf(Player);
        });

        it('creates a new playlist instance', () => {
            document.body.innerHTML = '<div id="container"><audio id="audio"></audio></div>';

            const playlist = Factory.createPlaylist(
                [{ url: '/stubs/sine.wav', strategy: { type: 'json', url: '/stubs/sine.json' } }],
                { container: '#container', audioElement: '#audio' },
            );

            expect(playlist).toBeInstanceOf(Playlist);
        });
    });
});
