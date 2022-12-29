import { Factory } from '../../src/index';
import Player, { JsonStrategy } from '../../src/Player';
import Playlist from '../../src/Playlist';
import { Playlist as PlaylistContract } from '../../src/types/Playlist';
import { addClass, removeClass, toggleClass } from './utils';

document.addEventListener('DOMContentLoaded', async () => {
    const anchors = [...document.querySelectorAll<HTMLAnchorElement>('.panel-block')];

    // Create a new playlist instance
    const playlist = Factory.createPlaylist(
        anchors.map((anchor) => ({
            url: `${anchor.dataset.path}.mp3`,
            strategy: new JsonStrategy(`${anchor.dataset.path}.json`),
        })),
        { container: '#waveform' },
    ).reset();

    playlist.onEnded = (playlist: PlaylistContract): void => handleEnded(playlist, anchors);

    anchors.forEach((anchor) => anchor.addEventListener('click', handleClick.bind(null, playlist, anchor, anchors)));

    playlist.player.audioElement.addEventListener('play', handlePlay.bind(null, playlist, anchors));
    playlist.player.audioElement.addEventListener('pause', handlePause.bind(null, playlist, anchors));
});

/**
 * Update the UI when the end of the playlist has been reached.
 *
 * @param {Playlist} playlist
 * @param {HTMLAnchorElement[]} anchors
 * @returns {void}
 */
const handleEnded = (playlist: PlaylistContract, anchors: HTMLAnchorElement[]): void => {
    const icon = resolveIcon(anchors[playlist.current]);

    if (!icon) return;

    addClass(removeClass(icon, 'fa-pause'), 'fa-play');
    removeClass(anchors[playlist.current], 'is-active');
};

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
        playlist.player.paused() ? playlist.player.play() : playlist.player.pause();
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
 * Resolve the icon element nested inside an anchor element.
 *
 * @param {HTMLAnchorElement} anchor
 * @returns {(?HTMLLIElement|undefined)}
 */
const resolveIcon = (anchor: HTMLAnchorElement): HTMLLIElement | undefined | null => {
    if (!anchor.firstElementChild) return;

    return anchor.firstElementChild.firstElementChild as HTMLLIElement | null;
};
