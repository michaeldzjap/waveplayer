import { Factory } from '../../src/index';
import Playlist from '../../src/Playlist';
import { addClass, removeClass } from './utils';

document.addEventListener('DOMContentLoaded', async () => {
    const anchors = [...document.querySelectorAll<HTMLAnchorElement>('.panel-block')];

    // Create a new playlist instance and prepare it for playback
    const playlist = await Factory.createPlaylist(
        anchors.map((anchor) => ({
            url: `${anchor.dataset.path}.mp3`,
            strategy: { type: 'json', url: `${anchor.dataset.path}.json` },
        })),
        { container: '#waveform' },
    ).prepare();

    anchors.forEach((anchor) => anchor.addEventListener('click', handleClick.bind(null, playlist, anchor, anchors)));

    playlist.player.audioElement.addEventListener('play', handlePlay.bind(null, playlist, anchors));
    playlist.player.audioElement.addEventListener('pause', handlePause.bind(null, playlist, anchors));
    playlist.player.audioElement.addEventListener('ended', handleEnded.bind(null, playlist, anchors));
});

/**
 * Initiate playback of the selected track.
 *
 * @param {Playlist} playlist
 * @param {HTMLAnchorElement} anchor
 * @param {HTMLAnchorElement[]} anchors
 * @returns {void}
 */
const handleClick = (playlist: Playlist, anchor: HTMLAnchorElement, anchors: HTMLAnchorElement[]): void => {
    if (anchors[playlist.current] === anchor) {
        playlist.player.paused ? playlist.player.play() : playlist.player.pause();
    } else {
        playlist.select(anchors.indexOf(anchor));
    }
};

/**
 * Update the UI when playback of a track in the playlist starts.
 *
 * @param {Playlist} playlist
 * @param {HTMLAnchorElement[]} anchors
 * @returns {void}
 */
const handlePlay = (playlist: Playlist, anchors: HTMLAnchorElement[]): void => {
    const icon = resolveIcon(anchors[playlist.current]);

    if (!icon) return;

    addClass(removeClass(icon, 'fa-play'), 'fa-pause');
    addClass(anchors[playlist.current], 'is-active');

    anchors
        .filter((anchor) => anchor !== anchors[playlist.current])
        .forEach((anchor) => {
            const icon = resolveIcon(anchor);

            if (!icon) return;

            addClass(removeClass(icon, 'fa-pause'), 'fa-play');
            removeClass(anchor, 'is-active');
        });
};

/**
 * Update the UI when playback of a track in the playlist is paused.
 *
 * @param {Playlist} playlist
 * @param {HTMLAnchorElement[]} anchors
 * @returns {void}
 */
const handlePause = (playlist: Playlist, anchors: HTMLAnchorElement[]): void => {
    const icon = resolveIcon(anchors[playlist.current]);

    if (!icon) return;

    addClass(removeClass(icon, 'fa-pause'), 'fa-play');
};

/**
 * Update the UI when the end of the playlist has been reached.
 *
 * @param {Playlist} playlist
 * @param {HTMLAnchorElement[]} anchors
 * @returns {void}
 */
const handleEnded = (playlist: Playlist, anchors: HTMLAnchorElement[]): void => {
    if (!playlist.ended) return;

    const icon = resolveIcon(anchors[playlist.current]);

    if (!icon) return;

    addClass(removeClass(icon, 'fa-pause'), 'fa-play');
    removeClass(anchors[playlist.current], 'is-active');
};

/**
 * Resolve the icon element nested inside an anchor element.
 *
 * @param {HTMLAnchorElement} anchor
 * @returns {(?HTMLLIElement|undefined)}
 */
const resolveIcon = (anchor: HTMLAnchorElement): HTMLLIElement | undefined | null => {
    if (!anchor.firstElementChild) return;

    return anchor.firstElementChild.firstElementChild as HTMLLIElement | null;
};
