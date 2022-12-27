import { View } from '../../src/index';
import { extractAmplitudes } from '../../src/audio';

document.addEventListener('DOMContentLoaded', async () => {
    // Some sample audio amplitude data
    const data = await extractAmplitudes('/audio/noise.wav');

    // Create a new view instance
    const view = new View(data, { container: '#waveform' });

    view.progress = 0.5;

    // Draw the view
    view.draw();
});
