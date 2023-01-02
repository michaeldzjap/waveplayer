![NPM Version](https://img.shields.io/npm/v/waveplayer.svg?branch=master)
![downloads](https://img.shields.io/npm/dt/waveplayer.svg)
[![Build Status](https://travis-ci.org/michaeldzjap/waveplayer.js.svg?branch=master)](https://travis-ci.org/michaeldzjap/waveplayer.js)
![dependencies](https://img.shields.io/librariesio/release/npm/waveplayer)
[![tested with jest](https://img.shields.io/badge/tested_with-jest-99424f.svg)](https://github.com/facebook/jest)
[![codecov](https://codecov.io/gh/michaeldzjap/waveplayer/branch/master/graph/badge.svg)](https://codecov.io/gh/michaeldzjap/waveplayer)
[![License](https://img.shields.io/npm/l/waveplayer.svg)](https://github.com/michaeldzjap/waveplayer.js/blob/master/LICENSE)

# waveplayer

An HTML5 based audio player with a waveform view.

![Screenshot](waveform.png?raw=true "Example")

Author: Michael Dzjaparidze

License: MIT

## Table of Contents

- [Requirements](#requirements)
- [Installation](#installation)
- [API](#api)
- [Examples](#examples)
    - [Player](#player)
    - [Playlist](#playlist)
    - [View](#view)
    - [Strategies](#strategies)

## Requirements
In order to minimise waveform drawing times it is adviced to supply waveform amplitude data yourself using either the _data_ or _JSON_ strategies. There exist a number of tools for extracting waveform data in JSON format from an audio file; [wav2json](https://github.com/beschulz/wav2json) or [py-wav2json](https://github.com/michaeldzjap/py-wav2json) can be used for instance. It is enough to provide a single array of floating point values. If the JSON contains a collection of name / value pairs only the first name / value pair will be used.

## Installation
This package is available through [npm](https://www.npmjs.com/):
```
npm install --save waveplayer
```
After that the package may be directly included using a `<script>` tag:
```html
<script src="path-to-waveform-js/waveplayer.js"></script>
```
or may be imported (ES6) in your own scripts files:
```javascript
import WavePlayer from 'waveplayer';
```

## API

The constructor of each class takes an option object as an argument. See the [Options](#options) section for more information on which options are available. Some options are required (currently only the _container_ option).

### Factory

A convenience class for building player or playlist instances without having to explicitly specify any dependencies yourself.

#### `player = Factory.create(options);`

Create a new player instance.

| Argument | Example | Type | Required | Description |
|----------|---------|------|----------|-------------|
| options | `{ container: '#container' }` | `Object` | Yes | An object where each key / value pair represents a valid player or view option. |

##### Returns

A fully initialised `Player` instance that can be used to load and play audio files.

#### `playlist = Factory.createPlaylist(tracks, options);`

Create a new playlist instance.

| Argument | Example | Type | Required | Description |
|----------|---------|------|----------|-------------|
| tracks | `[ { url: 'path-to-audio.mp3', strategy: new DataStrategy([...]) } ]` | `Array<{ url: string; strategy: Strategy }>` | Yes | An array of objects, where each object references an URL or path to an audio file and a strategy data object that instructs how to resolve the amplitude data associated with the audio file. See the [Strategies](#strategies) section for more information on the available strategies and how to use them. |
| options | `{ container: '#container' }` | `Object` | Yes | An object where each key / value pair represents a valid player or view option. |

##### Returns

A fully initialised `Playlist` instance that can be used to load and play multiple audio files in succession.

### Player

#### `player = new Player(view, options);`

Create a new player instance.

| Argument | Example | Type | Required | Description |
|----------|---------|------|----------|-------------|
| view | `new View([], { container: '#container' })` | `View` | Yes | A view instance used for drawing the waveform associated with the audio file that will be loaded. |
| options | `{ audioElement: '#audio' }` | `Object` | No | An object where each key / value pair represents a valid player option. |

##### Returns

A fully initialised `Player` instance that can be used to load and play audio files.

#### `const player = await player.load(url, strategy);`

Load an audio track using a specific strategy.

| Argument | Example | Type | Required | Description |
|----------|---------|------|----------|-------------|
| url | `'path-to-audio.mp3'` | `string` | Yes | A path or URL to an audio file |
| strategy | `new JsonStrategy('path-to-amplitude-data.json')` | `Strategy` | Yes | A strategy data object that instructs how to resolve the amplitude data associated with the audio file. |

##### Returns

A promise that resolves to the player instance on which the method was called.

#### `const player = await player.play();`

Start playback of the currently loaded audio file.

##### Returns

A promise that resolves to the player instance on which the method was called.

#### `const player = player.pause();`

Pause playback of the currently loaded audio file.

##### Returns

The player instance on which the method was called.

#### `const player = player.skipTo(seconds);`

Skip to a specific time in the audio file.

| Argument | Example | Type | Required | Description |
|----------|---------|------|----------|-------------|
| seconds | `60` | `number` | Yes | The time in seconds to skip to. |

##### Returns

The player instance on which the method was called.

#### `player.destroy();`

Destroy the player instance and do the appropriate clean up. This will pause audio playback, remove all internally registered event handlers, remove the HTML audio element from the DOM if it was created by the player instance, and lastly call `view.destroy()`.

## Examples

This section discusses a few simple examples for more worked out, fully working examples see the _/examples_ directory.

### Player

Create a player instance and pass in some (optional) options:

```javascript
import { DataStrategy, Factory } from 'waveplayer';

const player = Factory.create({
    container: '#waveform',
    barWidth: 4,
    barGap: 1,
    height: 128,
});

await player.load('url-to-some-audio-file.mp3', new DataStrategy([...]));

player.play();
```

If you need more control or don't like factory classes for some reason you can also create a player instance explicitly:

```javascript
import { Player, View } from 'waveplayer';

const player = new Player(new View([], { 'container': '#container' }), { 'audioElement': '#audio' });
```

### Playlist

Load some audio files from a URL and start playback when loading has finished:

```javascript
import { DataStrategy, Factory } from 'waveplayer';

playlist = await Factory.createPlaylist(
    [{ url: 'url-to-some-audio-file.mp3', strategy: new DataStrategy([...]) }],
    { container: '#waveform' },
).prepare();

playlist.play();
```

Similarly to the `Player` class you can also create a playlist instance explicitly:

```javascript
import { Player, Playlist, View, JsonStrategy } from 'waveplayer';

const playlist = new Playlist(
    new Player(new View([], { container: '#waveform' })),
    [{ url: 'url-to-some-audio-file.mp3', strategy: new JsonStrategy('url-to-some-amplitude-data.json') }],
);
```

### View

It is also possible to only use the view part of _waveplayer_ if you are interested in the drawing of waveform data only:

```javascript
import { View } from 'waveplayer';

const view = new View([...], { 'container': '#container' });

view.progress = 0.5;

view.draw();
```

### Strategies

_waveplayer_ v2 introduces the concept of strategies for providing amplitude data for a track that should be used to draw waveforms. Each track you wish to load should reference a path / URL to the audio file and in addition specify how the amplitude data for this track should be loaded. Currently, three strategies are available:

#### Data Strategy

Use this strategy if your waveform amplitude data is readily available in the form of an array of floating point values, assumed to be in the range [-1, 1].

#### JSON Strategy

Use this strategy if your waveform amplitude data is stored inside a _JSON_ file. This _JSON_ file should either consist of a single array structure containing floating point values, assumed to be in the range [-1, 1] or key / value pairs where the value point to such an array. Currently, only the first key / value pair is used for the amplitude data.

#### WebAudio Strategy

Although convenient, this strategy is a bit experimental and if you can use either the _JSON_ or data strategies it is generally adviced to use one of these. Use this strategy if you would like to extract the amplitude data of an audio file during runtime. Note that this could take a considerable amount of time depending on the duration of the audio file and the number of points you would like to extract. Also, not all audio file formats are supported, although _MP3_ and _WAV_ should work just fine.

> _**Note**: The JSON and WebAudio strategies cache amplitude data by default in order to speed up subsequent loading of the same audio files. If you don't want this to happen you should set the "cache" flag of the relevant strategy to `false`._



## Options

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

## Methods
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
