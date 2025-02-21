import { Factory } from '../../src/index';
import { toggleClass } from './utils';

document.addEventListener('DOMContentLoaded', async () => {
	// Create a new player instance
	const player = Factory.createPlayer({ container: '#waveform' });
	const button = document.getElementById(
		'playback-button',
	) as HTMLButtonElement | null;

	if (!button) return;

	// Load a track and activate the playback button when finished
	await player.load('../audio/extase_1.mp3', {
		type: 'json',
		url: '../audio/extase_1.json',
	});

	button.disabled = false;

	button.onclick = () => {
		if (!button.firstElementChild) return;

		const icon = button.firstElementChild
			.firstElementChild as HTMLLIElement | null;

		if (!icon) return;

		toggleClass(icon, 'fa-pause', 'fa-play');

		player.paused ? player.play() : player.pause();
	};
});
