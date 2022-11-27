import { Factory } from '../../src/index';

document.addEventListener('DOMContentLoaded', async () => {
    // Create and initialise a new wave player instance
    const wavePlayer = await Factory.create({ container: '#waveform' }).initialise();

    const button = document.getElementById('playback-button');
});
