import WavePlayer from '../../dist/waveplayer';
import { toggleClass, addClass, removeClass } from './lib';

/**
 * Application state.
 *
 * @var {Object}
 */
let state = {
    selectedTrackNumber: 1,
};

/**
 * The HTML elements representing the tracks.
 *
 * @var {Array}
 */
let trackNodes;

/**
 * The WavePlayer instance.
 *
 * @var {WavePlayer}
 */
let wavePlayer;

/**
 * Update the application state.
 *
 * @param  {Object} newState
 * @returns {void}
 */
const setState = (newState) => (state = { ...state, ...newState });

/**
 * Update the UI in response to switching tracks.
 *
 * @param  {node} node
 * @param  {number} trackNumber
 * @returns {void}
 */
const switchTracks = (node) => {
    const previousNode = trackNodes.find(
        (trackNode) => state.selectedTrackNumber === parseInt(trackNode.dataset.trackNumber),
    );

    // Update the play/pause icons
    addClass(removeClass(previousNode.firstElementChild.firstElementChild, 'fa-pause'), 'fa-play');
    addClass(removeClass(node.firstElementChild.firstElementChild, 'fa-play'), 'fa-pause');

    // Update the active panel block
    removeClass(previousNode, 'is-active');
    addClass(node, 'is-active');
};

/**
 * Handle the case where the waveplayer instance advances to the next track in
 * the playlist.
 *
 * @param  {WavePlayer} me
 * @param  {Object} trackInfo
 * @returns {void}
 */
const handleChange = (me, { trackNumber }) => {
    const node = trackNodes.find((trackNode) => trackNumber === parseInt(trackNode.dataset.trackNumber));
    switchTracks(node, trackNumber);
    setState({ selectedTrackNumber: trackNumber });
};

/**
 * Handle track selection by the user.
 *
 * @param  {node} node
 * @param  {MouseEvent} e
 * @returns {void}
 */
const handleClick = (node) => {
    const trackNumber = parseInt(node.dataset.trackNumber);

    if (trackNumber === state.selectedTrackNumber) {
        toggleClass(node.firstElementChild.firstElementChild, 'fa-pause', 'fa-play');
        if (wavePlayer.isPlaying()) {
            wavePlayer.pause();
        } else {
            wavePlayer.play();
        }
    }

    if (trackNumber !== state.selectedTrackNumber) {
        switchTracks(node);

        if (trackNumber - state.selectedTrackNumber === 1) {
            wavePlayer.playlist.next();
        }

        if (trackNumber - state.selectedTrackNumber === -1) {
            wavePlayer.playlist.previous();
        }

        if (Math.abs(trackNumber - state.selectedTrackNumber) > 1) {
            wavePlayer.playlist.skipTo(trackNumber);
        }

        setState({ selectedTrackNumber: trackNumber });
    }
};

document.addEventListener('DOMContentLoaded', () => {
    // Create a new waveplayer.js instance
    wavePlayer = new WavePlayer({
        container: '#waveform',
        barWidth: 4,
        barGap: 1,
        height: 128,
    });

    trackNodes = [...document.querySelectorAll('.panel-block')];

    // Schedule a new playlist and load the first audio track
    wavePlayer.createPlaylist(trackNodes.map((elm) => elm.dataset.url));

    // Fired after the next track in the playlist is loaded and just before it
    // will start playing
    wavePlayer.on('waveplayer:playlist:next', handleChange);

    // Bind click handlers
    for (const trackNode of trackNodes) {
        trackNode.onclick = handleClick.bind(null, trackNode);
    }
});
