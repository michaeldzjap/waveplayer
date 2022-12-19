import { Factory, WavePlayer } from '../src/index';

describe('index', () => {
    describe('Factory', () => {
        it('creates a new wave player instance', () => {
            document.body.innerHTML = '<div id="container"><audio id="audio"></audio></div>';

            const player = Factory.create({ container: '#container', audioElement: '#audio' });

            expect(player).toBeInstanceOf(WavePlayer);
        });
    });
});
