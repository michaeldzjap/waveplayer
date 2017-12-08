import WavePlayer from '../dist/waveplayer.js';

document.addEventListener('DOMContentLoaded', () => {
    // Create a new waveplayer.js instance
    const wavePlayer = new WavePlayer({
        container: '#waveform',
        barWidth: 4,
        barGap: 1,
        height: 128
    });
});
