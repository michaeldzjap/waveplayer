import { WaveView } from '../../src/index';
import { extractAmplitudes } from '../../src/audio';

document.addEventListener('DOMContentLoaded', async () => {
    // Some sample audio amplitude data
    const data = await extractAmplitudes('/audio/noise.wav');

    // Create a new wave view instance
    const view = new WaveView(data, { container: '#waveform' });

    view.progress = 0.5;

    // Render the wave view
    view.render();
});
