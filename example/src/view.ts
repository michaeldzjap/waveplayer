import { WaveView } from '../../src/index';
import { extractAmplitudes } from '../../src/audio';

document.addEventListener('DOMContentLoaded', async () => {
    // Some audio amplitude data
    const data = await extractAmplitudes('/audio/sine.wav');

    // Create a new wave view instance
    const view = new WaveView(data, { container: '#waveform' });

    // Render the wave view
    view.render();
});
