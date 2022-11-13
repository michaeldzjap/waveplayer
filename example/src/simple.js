import WavePlayer from '../../dist/waveplayer';
import { toggleClass } from './lib';

/**
 * The WavePlayer instance.
 *
 * @var {WavePlayer}
 */
let wavePlayer;

document.addEventListener('DOMContentLoaded', () => {
    // Create a new waveplayer.js instance
    wavePlayer = new WavePlayer({
        container: '#waveform',
        barWidth: 4,
        barGap: 1,
        height: 128,
    });

    const button = document.getElementById('playback-button');

    // Load a track and activate the playback button when finished
    wavePlayer.load('../audio/extase_1.mp3').then(() => (button.disabled = false));

    button.onclick = () => {
        toggleClass(button.firstElementChild.firstElementChild, 'fa-pause', 'fa-play');

        if (wavePlayer.isPlaying()) {
            wavePlayer.pause();
        } else {
            wavePlayer.play();
        }
    };
});
