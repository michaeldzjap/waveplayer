import WavePlayer from '../../dist/waveplayer';
import { toggleClass, addClass, removeClass } from './lib';

/**
 * Application state.
 *
 * @var {Object}
 */
let state = {
    selectedTrackNumber: 1
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

document.addEventListener('DOMContentLoaded', () => {
    // Create a new waveplayer.js instance
    wavePlayer = new WavePlayer({
        container: '#waveform',
        barWidth: 4,
        barGap: 1,
        height: 128
    });

    trackNodes = [...document.querySelectorAll('.panel-block')];

    // Schedule a new playlist and load the first audio track
    wavePlayer.createPlaylist(
        // Fetch audio URL's
        trackNodes.map(elm => elm.dataset.url)
    );

    // Fired when the playlist is ready to be played
    // wavePlayer.on('waveplayer:playlist:ready', me => console.log(me));

    // Fired after the next track in the playlist is loaded and just before it
    // will start playing
    wavePlayer.on('waveplayer:playlist:next', handleChange);

    for (const trackNode of trackNodes) {
        trackNode.onclick = handleClick.bind(null, trackNode);
    }
});

/**
 * Handle track selection by the user.
 *
 * @param {node} node
 * @param {MouseEvent} e
 * @return {void}
 */
const handleClick = node => {
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

        // console.log(trackNumber, state.selectedTrackNumber);
        // if (trackNumber > state.selectedTrackNumber) {
        //     for (let i = 0; i < trackNumber - state.selectedTrackNumber; i++) {
        //         console.log(i);
        //         wavePlayer.next();
        //     }
        // }

        setState({selectedTrackNumber: trackNumber});

        // Schedule a new playlist
        // wavePlayer.schedulePlaylist(
        //     // Fetch audio URL's
        //     (trackNumber === 1 ? trackNodes : trackNodes.slice(trackNumber - 1))
        //         .map(elm => elm.dataset.url),
        //     {autoPlay: true}
        // );
    }
};

/**
 * Update the UI in response to switching tracks.
 *
 * @param {node} node
 * @param {Number} trackNumber
 * @return {void}
 */
const switchTracks = node => {
    const previousNode = trackNodes.find(trackNode => state.selectedTrackNumber === parseInt(trackNode.dataset.trackNumber));

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
 * @param {WavePlayer} me
 * @param {Object} trackInfo
 * @return {void}
 */
const handleChange = (me, {url, trackNumber}) => {
    console.log(url, trackNumber);
    const node = trackNodes.find(trackNode => trackNumber === parseInt(trackNode.dataset.trackNumber));
    switchTracks(node, trackNumber);
};

/**
 * Update the application state.
 *
 * @param {Object} newState
 * @return {void}
 */
const setState = newState => state = {...state, ...newState};
