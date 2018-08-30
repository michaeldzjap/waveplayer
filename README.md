![NPM Version](https://img.shields.io/npm/v/waveplayer.svg?branch=master)
![downloads](https://img.shields.io/npm/dt/waveplayer.svg) [![Build Status](https://travis-ci.org/michaeldzjap/waveplayer.js.svg?branch=master)](https://travis-ci.org/michaeldzjap/waveplayer.js) ![dependencies](https://img.shields.io/david/michaeldzjap/waveplayer.js.svg)
![dev dependencies](https://img.shields.io/david/dev/michaeldzjap/waveplayer.js.svg)
[![License](https://img.shields.io/npm/l/react-signature-pad-wrapper.svg)](https://github.com/michaeldzjap/waveplayer.js/blob/master/LICENSE)

# waveplayer.js

An HTML5 based audio player with a waveform view. Inspired by [wavesurfer.js](http://wavesurfer-js.org/) and [waveform.js](http://www.waveformjs.org/), but different.

![Screenshot](waveform.png?raw=true "Example")

Author: Michael Dzjaparidze

License: MIT

## Browser Support & Other Requirements
*waveplayer.js* is tested to work on *Chrome*, *Firefox* and *Opera* (no support for *Internet Explorer* yet).

In order to minimise waveform drawing times it is necessary to supply an URL to a JSON file or a data array / object representing the waveform of the audio file numerically. When supplying a JSON file, it should have the same name as the corresponding audio file and should exist at the same location. An error will be thrown if this JSON file does not exist and no waveform data was passed in explicitly as a second argument to the `load()` function.

There exist a number of tools for extracting waveform data in JSON format from an audio file; [wav2json](https://github.com/beschulz/wav2json) or [py-wav2json](https://github.com/michaeldzjap/py-wav2json) can be used for instance. It is enough to provide a single array of floating point values. If the JSON contains an associative array, only the first entree will be used.

## Installation
This package is available through [npm](https://www.npmjs.com/):
```
npm install --save waveplayer
```
The package is also still available through [bower](https://bower.io/), although this will be faded out eventually
```
bower install waveplayer.js
```
After that the package may be directly included using a `<script>` tag:
```html
<script src="path-to-waveform-js/waveplayer.min.js"></script>
```
or may be imported (ES6) in your own scripts files:
```javascript
import WavePlayer from 'waveplayer';
```

## Examples

### Load an audio file and play it
Create a waveplayer.js instance and pass in some (optional) options:

```javascript
import WavePlayer from 'waveplayer';

var wavePlayer = new WavePlayer({
    container: '#waveform',
    barWidth: 4,
    barGap: 1,
    height: 128
});
```
Load an audio file from a URL and start playback when loading has finished:

```javascript
wavePlayer.load('url-to-some-audio-file.mp3')
    .then(() => waveplayer.play());
```

### Schedule a playlist and play it through from start to finish
Load some audio files from a URL and start playback when loading has finished:
```javascript
wavePlayer.createPlaylist(
    ["1.mp3", "2.mp3", "3.mp3", "4.mp3", "5.mp3"]
);

wavePlayer.on('waveplayer:playlist:ready', me => {
    me.play();
});
```
View the code for a full playlist example [here](/example/src/playlist.js)

## waveplayer.js Options

| option | type | default | description |
| --- | --- | --- | --- |
| `barGap` | integer | `1` | Gap between bars in pixels. |
| `barWidth` | integer | `4` | Width of a bar in pixels. |
| `container` | mixed | `null` | **Required**: CSS-selector or HTML-element for displaying the waveform. |
| `height` | integer | `128` | The height of the waveform in pixels. |
| `interact` | boolean | `true` | Enables/disables mouse interaction with the waveform view. This may be changed at any point after creation. |
| `preload` | string | `metadata` | The value of the preload attribute of the audio element. |
| `progressColor` | string | `#31708f` | The fill color of the waveform bars that have been played back so far. |
| `responsive` | boolean | `true` | If set to true, the width of the waveform view adapts to the width of the container element. |
| `useGradient` | boolean | `true` | Indicates if the waveform should be drawn with a gradient or not. |
| `waveColor` | string | `#428bca` | The fill color of the waveform bars that have not been played back so far. |
| `width` | integer | `512` | The width of the waveform in pixels (only relevant when the `responsive` option is set to `false`). |

## waveplayer.js Methods
* `cancelPlaylist()`

    Cancels the currently active playlist (will also stop the audio instantly).
* `createPlaylist(urls, options)`

    Creates a new playlist (it will cancel the currently active playlist if there is one).

    **Arguments**:

    `urls` is an array of valid audio file URL's or an array of objects each having an `url` and `data` property, where `url` points to the audio file URL and `data` is an array or object holding valid waveform data (also see documentation for `load()`).

    `options` (**optional**) is an object with the following keys:

    - `autoPlay`: A boolean that indicates if the playlist should start playing automatically after it was created.
* `currentTime`

    Getter for the playback time (in seconds) of the currently loaded / playing track.
* `destroy()`

    Stops playback, cancels any running playlists and unsubscribes from any events that are listened for.
* `duration`

    Getter for the total duration (in seconds) of the currently loaded / playing track.
* `load(url, data)`

    Load an audio file from a URL and return a Promise which may be used to perform an action when the audio file has finished loading.

    **Arguments**:

    `url` is a valid URL to an audio file.

    `data` (**optional**) is an array or object containing waveform data. If it is not supplied, the waveform data is extracted from the JSON file. If `data` is an object it is expected that the first key points to an array of waveform values. Note that only the first key found in the object is queried for waveform data.
* `loadAudio(url)`

    Load an audio file from a URL without loading the waveform data and rendering the waveform.

    **Arguments**:

    `url` is a valid URL to an audio file.
* `loadWaveform(data)`

    Load the waveform data from a URL to a JSON file or explicitly provided waveform data without loading the audio file.

    **Arguments**:

    `data` is either a string representing a valid URL to a JSON file containing the waveform data or an array or object containing waveform data.
* `interact` or `interact = bool`

    Setter or getter for enabling/disabling mouse interaction with the waveform view.

    **Arguments**:

    `bool` is a boolean value for determining whether mouse interaction with the waveform view should be enabled or disabled.
* `isPlaying()`

    Returns a boolean indicating whether audio is currently playing or not.
* `on(topic, fn)`

    Subscribe to an event with a custom event handler.

    **Arguments**:

    `topic` is a string denoting a valid event name to which to subscribe.

    `fn()` is the callback that will be evaluated every time the event is fired.
* `pause()`

    Pause the currently playing audio file.
* `play()`

    Start playback of currently loaded audio file.
* `responsive` or `responsive = bool`

    Setter or getter for enabling/disabling responsive mode for the waveform view. If set, the width of the waveform view will adapt to the width of its parent container element.

    **Arguments**:

    `bool` is a boolean value for determining whether to switch between a responsive or fixed design of the waveform view.
* `skipTo(seconds)`

    Set the current time in seconds from which to playback audio.

    **Arguments**:

    `seconds` is a float value denoting the current time from which to playback the audio file.
* `un(topic, fn)`

    Unsubscribe a particular callback or from the whole event all together.

    **Arguments**:

    `topic` is a string denoting a valid event name from which to unsubscribe.

    `fn()` (**optional**) is a callback from which to unsubscribe.

* `volume` or `volume = value`

    Set or get the audio playback volume, range: `[0 - 1]`.

    **Arguments**:

    `value` sets the audio playback volume to this value.

## waveplayer.js Events

* `waveplayer:canplay` - Identical to the corresponding [Media event](https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Media_events). Fired when enough data is available so that the media can be played, at least for a couple of frames. Callback will receive the waveplayer instance.
* `waveplayer:initialized` - Fired when the waveform view has been constructed and the HTML audio element has been created. Callback will receive the waveplayer instance.
* `waveplayer:skipped` - Fired when the audio file was skipped forward or backward in time. Callback will receive the waveplayer instance and the new position of the playback header (in seconds).
* `waveplayer:playlist:finished` - Fired when the playlist has finished playing all the queued audio. Callback will receive the waveplayer instance.
* `waveplayer:playlist:next` - Fired when the next track in the playlist has been loaded and is about to be played. Callback will receive the waveplayer instance and an object with track information.
* `waveplayer:playlist:ready` - Fired when the the first audio file in the playlist has finished loading. Callback will receive the waveplayer instance.
