import WavePlayer from '../../dist/waveplayer';
import { toggleClass, addClass, removeClass } from './lib';

/**
 * Application state.
 *
 * @var {object}
 */
let state = {
    selectedTrackNumber: 1,
    isPlaying: false
};

/**
 * The HTML elements representing the tracks.
 *
 * @var {array}
 */
let trackNodes;

document.addEventListener('DOMContentLoaded', () => {
    // Create a new waveplayer.js instance
    const wavePlayer = new WavePlayer({
        container: '#waveform',
        barWidth: 4,
        barGap: 1,
        height: 128
    });

    trackNodes = [...document.querySelectorAll('.panel-block')];

    // Schedule a new playlist and load the first audio track
    wavePlayer.schedulePlaylist(
        // Fetch audio URL's
        trackNodes.map(elm => elm.dataset.url)
    );

    // Fired when the playlist is ready to be played
    wavePlayer.on('waveplayer:playlist:ready', () => console.log('Playlist is ready for playback'));

    for (const trackNode of trackNodes) {
        trackNode.onclick = handleClick;
    }
});

/**
 * Handle track selection by the user.
 *
 * @param {number} trackNumber
 * @param {MouseEvent} e
 * @return {void}
 */
const handleClick = e => {
    const node = e.target;
    const trackNumber = parseInt(node.dataset.trackNumber);

    if (trackNumber === state.selectedTrackNumber) {
        toggleClass(node.firstElementChild.firstElementChild, 'fa-pause', 'fa-play');
        setState({isPlaying: !state.isPlaying});
    }

    if (trackNumber !== state.selectedTrackNumber) {
        const previousNode = trackNodes.find(trackNode => state.selectedTrackNumber === parseInt(trackNode.dataset.trackNumber));

        // Update the play/pause icons
        addClass(removeClass(previousNode.firstElementChild.firstElementChild, 'fa-pause'), 'fa-play');
        addClass(removeClass(node.firstElementChild.firstElementChild, 'fa-play'), 'fa-pause');

        // Update the active panel block
        removeClass(previousNode, 'is-active');
        addClass(node, 'is-active');

        setState({selectedTrackNumber: trackNumber, isPlaying: true});
    }
};

/**
 * Update the application state.
 *
 * @param {object} newState
 * @return {void}
 */
const setState = newState => state = {...state, ...newState};
