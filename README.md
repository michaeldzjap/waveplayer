![NPM Version](https://img.shields.io/npm/v/waveplayer.svg?branch=master)
![downloads](https://img.shields.io/npm/dt/waveplayer.svg)
![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/michaeldzjap/waveplayer/qa.yml?branch=master)
![Libraries.io dependency status for GitHub repo](https://img.shields.io/librariesio/github/michaeldzjap/waveplayer)
[![tested with jest](https://img.shields.io/badge/tested_with-jest-99424f.svg)](https://github.com/facebook/jest)
[![codecov](https://codecov.io/gh/michaeldzjap/waveplayer/branch/master/graph/badge.svg)](https://codecov.io/gh/michaeldzjap/waveplayer)
[![Quality gate](https://sonarcloud.io/api/project_badges/quality_gate?project=michaeldzjap_waveplayer)](https://sonarcloud.io/summary/new_code?id=michaeldzjap_waveplayer)
[![License](https://img.shields.io/npm/l/waveplayer.svg)](https://github.com/michaeldzjap/waveplayer.js/blob/master/LICENSE)

# waveplayer

An _HTML5_ based audio player with a waveform view.

![Screenshot](waveplayer.png?raw=true "Example")

Author: _Michael Dzjaparidze_

License: _MIT_

## Table of Contents

- [Requirements](#requirements)
- [Installation](#installation)
- [API](#api)
    - [Factory](#factory)
    - [Player](#player)
    - [Playlist](#playlist)
    - [View](#view)
    - [Strategies](#strategies)
- [Examples](#examples)
    - [Player](#player)
    - [Playlist](#playlist)
    - [View](#view)

## Requirements
In order to minimise waveform drawing times it is adviced to supply waveform amplitude data yourself using either the data or _JSON_ strategies. There exist a number of tools for extracting waveform data in _JSON_ format from an audio file; [wav2json](https://github.com/beschulz/wav2json) or [py-wav2json](https://github.com/michaeldzjap/py-wav2json) can be used for instance. It is enough to provide a single array of floating point values. If the _JSON_ contains a collection of name / value pairs only the first name / value pair will be used.

## Installation
This package is available through [npm](https://www.npmjs.com/):
```
npm install --save waveplayer
```
After that the package may be directly included using a `<script>` tag:
```html
<script src="path-to-waveform-js/waveplayer.js"></script>
```
or may be imported in your own scripts files:
```javascript
import { Player, Playlist, View } from 'waveplayer';
```

## API

The constructor of each class takes an option object as an argument. See the [Options](#options) section for more information on which options are available. Some options are required (currently only the _container_ option).

### Factory

A convenience class for building player or playlist instances without having to explicitly specify any dependencies yourself.

#### `player = Factory.createPlayer(options);`

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
| tracks | `[ { url: 'path-to-audio.mp3', strategy: { type: 'data', data: [0.1, -0.4, ...] } } ]` | `Array<{ url: string; strategy: Strategy }>` | Yes | An array of objects, where each object references an URL or path to an audio file and a strategy data object that instructs how to resolve the amplitude data associated with the audio file. See the [Strategies](#strategies) section for more information on the available strategies and how to use them. |
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
| strategy | `{ type: 'json', url: 'path-to-amplitude-data.json' }` | `Strategy` | Yes | A strategy data object that instructs how to resolve the amplitude data associated with the audio file. |

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

#### `player.destroy();`

Destroy the player instance and do the appropriate clean up. This will pause audio playback, remove all internally registered event handlers, remove the HTML audio element from the DOM if it was created by the player instance, and lastly call `view.destroy()`.

#### `player.volume = 0.5;`

Get / set the volume of the currently playing audio file.

| Argument | Example | Type |
|----------|---------|------|
| volume | `0.5` | `number` |

#### `player.currentTime = 1;`

Get / set the current playback time in seconds.

| Argument | Example | Type |
|----------|---------|------|
| currentTime | `1` | `number` |

#### `player.duration;`

Get the duration of the currently playing audio file.

#### `player.paused;`

Get the flag that checks if audio playback is currently paused.

#### `player.view;`

Get the view instance associated with the player.

#### `player.audioElement;`

Get the HTML audio element associated with the player.

#### Options

| Option | Type | Default | Required | Description |
|--------|------|---------|----------|-------------|
| audioElement | `string \| HTMLAudioElement` | `undefined` | No | The HTML audio element associated with the player instance. If not passed in as an option when creating a new player instance it will be created internally. | 
| preload | `string` | `metadata` | No | The value of the preload attribute of the HTML audio element. **Note**: will only be used when the player instance creates the HTML audio element internally. |

### Playlist

#### `playlist = new Playlist(player, tracks);`

Create a new playlist instance.

| Argument | Example | Type | Required | Description |
|----------|---------|------|----------|-------------|
| player | `new Player(new View([], { container: '#container' }))` | `Player` | Yes | A player instance used for playing back all the tracks / audio files that make up the playlist. |
| tracks | `[ { url: 'path-to-audio.mp3', strategy: { type: 'data', data: [0.1, -0.4, ...] } } ]` | `Array<{ url: string; strategy: Strategy }>` | Yes | An array of objects, where each object references an URL or path to an audio file and a strategy data object that instructs how to resolve the amplitude data associated with the audio file. See the [Strategies](#strategies) section for more information on the available strategies and how to use them. |

##### Returns

A fully initialised `Playlist` instance that can be used to load and play multiple audio files in succession.

#### `const playlist = await playlist.prepare();`

Prepare a playlist for playback. This is an alias for `playlist.reset()`.

##### Returns

A promise that resolves to the playlist instance on which the method was called.

#### `const playlist = await playlist.reset();`

Reset a playlist. This will pause playback and set the first track in the playlist as the current track to play.

##### Returns

A promise that resolves to the playlist instance on which the method was called.

#### `const playlist = await playlist.next(forcePlay);`

Skip to the next track in the playlist.

| Argument | Example | Type | Required | Description |
|----------|---------|------|----------|-------------|
| forcePlay | `true` | `boolean` | No | This will start playback of the next track regardless if the playlist is currently paused. |

##### Returns

A promise that resolves to the playlist instance on which the method was called.

#### `const playlist = await playlist.previous(forcePlay);`

Skip to the previous track in the playlist.

| Argument | Example | Type | Required | Description |
|----------|---------|------|----------|-------------|
| forcePlay | `true` | `boolean` | No | This will start playback of the previous track regardless if the playlist is currently paused. |

##### Returns

A promise that resolves to the playlist instance on which the method was called.

#### `const playlist = await playlist.select(track, forcePlay);`

Select a specific track in the playlist.

| Argument | Example | Type | Required | Description |
|----------|---------|------|----------|-------------|
| track | `1` | `number` | Yes | The index of the track in the playlist that should be selected. |
| forcePlay | `true` | `boolean` | No | This will start playback of the selected track regardless if the playlist is currently paused. |

##### Returns

A promise that resolves to the playlist instance on which the method was called.

#### `playlist.destroy();`

Destroy the player instance and do the appropriate clean up. This will remove all internally registered event handlers and call `player.destroy()`.

#### `playlist.forcePlay = true;`

Get / set the flag that indicates whether playback should start after selecting another track in the playlist, regardless if the playlist is paused or not.

| Argument | Example | Type |
|----------|---------|------|
| forcePlay | `true` | `boolean` |

#### `playlist.player;`

Get the player instance associated with the playlist.

#### `playlist.current;`

Get the index of the currently playing track.

#### `playlist.ended;`

Get the flag that indicates whether the playlist has finished playback.

#### Options

| Option | Type | Default | Required | Description |
|--------|------|---------|----------|-------------|
| forcePlay | `boolean` | `true` | No | Indicates whether playback should start after selecting another track in the playlist, regardless if the playlist is paused or not. |

### View

#### `view = new View(data, options);`

Create a new view instance.

| Argument | Example | Type | Required | Description |
|----------|---------|------|----------|-------------|
| data | `[-0.1, 0.4, ...]` | `Array<number>` | Yes | An array of floating point values representing the amplitude of some audio file at equally spaced intervals that will be used to draw the waveform. |
| options | `{ container: '#container' }` | `Object` | Yes | An object where each key / value pair represents a valid view option. |

##### Returns

A fully initialised `View` instance that can be used to draw the waveform associated with an audio file.

#### `view = view.draw();`

Draw the waveform on the canvas HTML element.

##### Returns

The view instance on which the method was called.

#### `view = view.clear();`

Clear the canvas HTML element where the waveform is drawn on.

##### Returns

The view instance on which the method was called.

#### `view.destroy();`

Destroy the view instance and do the appropriate clean up. This will remove all internally registered event handlers and remove the HTML canvas element from the DOM.

#### `view.data = [-0.1, 0.4, ...];`

Get / set the waveform amplitude data.

| Argument | Example | Type |
|----------|---------|------|
| data | `[-0.1, 0.4, ...]` | `Array<number>` |

#### `view.progress = 0.5;`

Get / set the progress of the waveform, assumed to be in the range [0-1].

| Argument | Example | Type |
|----------|---------|------|
| progress | `0.5` | `number` |

#### `view.container = '#container';`

Get / set the HTML container element for the view instance.

| Argument | Example | Type |
|----------|---------|------|
| container | `'#container'` | `HTMLDivElement | string` |

#### `view.width = 512;`

Get / set the width of the drawn waveform. Setting the width only has an effect if the view instance is not operating in responsive mode.

| Argument | Example | Type |
|----------|---------|------|
| width | `512` | `number` |

#### `view.height = 128;`

Get / set the height of the drawn waveform.

| Argument | Example | Type |
|----------|---------|------|
| height | `128` | `number` |

#### `view.barWidth = 4;`

Get / set the width of a bar representing an element of the waveform.

| Argument | Example | Type |
|----------|---------|------|
| barWidth | `4` | `number` |

#### `view.barGap = 1;`

Get / set the width of the gap that separates consecutive bars.

| Argument | Example | Type |
|----------|---------|------|
| barGap | `1` | `number` |

#### `view.responsive = true;`

Get / set the flag that determines if the view instance is operating in responsive mode.

| Argument | Example | Type |
|----------|---------|------|
| responsive | `true` | `boolean` |

#### `view.gradient = true;`

Get / set the flag that determines if the waveform should be drawn with a gradient.

| Argument | Example | Type |
|----------|---------|------|
| gradient | `true` | `boolean` |

#### `view.interact = true;`

Get / set the interaction state of the view instance.

| Argument | Example | Type |
|----------|---------|------|
| interact | `true` | `boolean` |

#### `view.redraw = true;`

Get / set the redraw flag. This flag determines whether the waveform should be redrawn when setting one of the view properties that affects the look of the waveform (e.g. width, height, gradient).

| Argument | Example | Type |
|----------|---------|------|
| redraw | `true` | `boolean` |

#### `view.canvas;`

Get the HTML canvas element that is used for drawing the waveform.

#### Options

| Option | Type | Default | Required | Description |
|--------|------|---------|----------|-------------|
| container | `string \| HTMLDivElement` | `undefined` | Yes | CSS selector or div HTML element that acts as the container for the HTML canvas element on which the waveform will be drawn. |
| width | `integer` | `512` | No | The width of the waveform in pixels (only relevant when the `responsive` option is set to `false`). |
| height | `integer` | `128` | No | The height of the waveform in pixels. |
| waveformColor | `string` | `#428bca` | No | The fill color of the waveform bars that have not been played back so far. |
| progressColor | `string` | `#31708f` | No | The fill color of the waveform bars that have been played back so far. |
| barGap | `integer` | `1` | No | Gap between bars in pixels. |
| barWidth | `integer` | `4` | No | Width of a bar in pixels. |
| responsive | `boolean` | `true` | No | If set to true, the width of the waveform view adapts to the width of the container element. |
| gradient | `boolean` | `true` | No | Indicates if the waveform should be drawn with a gradient or not. |
| interact | `boolean` | `true` | No | Enables / disables mouse interaction with the waveform view. This may be changed at any point after creation. |
| redraw | `boolean` | `true` | No | Indicates if the waveform will be redrawn when one of the view properties that affects the look of the waveform (e.g. width, height, gradient) is set. |

### Strategies

_waveplayer_ v2 introduces the concept of strategies for providing amplitude data for an audio file that is used to draw waveforms. Each audio file you wish to load should reference a path / URL to the file and in addition specify how the amplitude data should be resolved. Currently, three strategies are available:

#### Data Strategy

Use this strategy if your waveform amplitude data is readily available in the form of an array of floating point values, assumed to be in the range [-1, 1].

| Key | Value | Type | Default | Required | Description |
|-----|-------|------|---------|----------|-------------|
| type | `'data'` | `string` | `undefined` | Yes | The strategy type identifier. |
| data | `[0.1, -0.4, ...]` | `Array<number>` | `undefined` | Yes | An array of floating point values representing the amplitude of some audio file at equally spaced intervals that will be used to draw the waveform. |

#### JSON Strategy

Use this strategy if your waveform amplitude data is stored inside a _JSON_ file. This _JSON_ file should either consist of a single array structure containing floating point values, assumed to be in the range [-1, 1] or key / value pairs where the value point to such an array. Currently, only the first key / value pair is used for the amplitude data. Waveform amplitude data extracted from a _JSON_ file is cached by default

| Key | Value | Type | Default | Required | Description |
|-----|-------|------|---------|----------|-------------|
| type | `'json'` | `string` | `undefined` | Yes | The strategy type identifier. |
| url | `'path-to-amplitude-data.json'` | `string` | `undefined` | Yes | A path or URL to a _JSON_ file containing amplitude data for an audio file. |
| cache | `true` | `boolean` | `true` | No | Determines whether to use cached amplitude data (if it exists) or to extract the data from the _JSON_ file. |

#### WebAudio Strategy

Although convenient, this strategy is a bit experimental and if you can use either the _JSON_ or data strategies it is generally adviced to use one of these. Use this strategy if you would like to extract the amplitude data of an audio file during runtime. Note that this could take a considerable amount of time depending on the duration of the audio file and the number of points you would like to extract. Also, not all audio file formats are supported, although _MP3_ and _WAV_ should work just fine.

| Key | Value | Type | Default | Required | Description |
|-----|-------|------|---------|----------|-------------|
| type | `'webAudio'` | `string` | `undefined` | Yes | The strategy type identifier. |
| points | `1200` | `number` | `800` | No | The number of equally spaced amplitude data points to extract from the audio file. |
| normalise | `false` | `boolean` | `true` | No | Determines whether to normalise the extracted data points (i.e. scale them such that the absolute maximum is 1). |
| logarithmic | `true` | `boolean` | `true` | No | Determines whether to compute the extracted data points on a logarithmic or linear scale. |
| cache | `false` | `boolean` | `true` | No | Determines whether to use cached amplitude data (if it exists) or to extract the data from the audio file. |

> _**Note**: The JSON and WebAudio strategies cache amplitude data by default in order to speed up subsequent loading of the same audio files. If this is undesired behaviour you should set the "cache" flag of the relevant strategy to `false`._

## Examples

This section discusses a few simple examples for more worked out, fully working examples see the _/examples_ directory.

### Player

Create a player instance and pass in some (optional) options:

```javascript
import { Factory } from 'waveplayer';

const player = Factory.createPlayer({
    container: '#waveform',
    barWidth: 4,
    barGap: 1,
    height: 128,
});

await player.load('url-to-some-audio-file.mp3', { type: 'data', data: [0.1, -0.4, ...] });

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
import { Factory } from 'waveplayer';

playlist = await Factory.createPlaylist(
    [{ url: 'url-to-some-audio-file.mp3', strategy: { type: 'data', data: [0.1, -0.4, ...] } }],
    { container: '#waveform' },
).prepare();

playlist.play();
```

Similarly to the `Player` class you can also create a playlist instance explicitly:

```javascript
import { Player, Playlist, View } from 'waveplayer';

const playlist = new Playlist(
    new Player(new View([], { container: '#waveform' })),
    [{ url: 'url-to-some-audio-file.mp3', strategy: { type: 'json', url: 'url-to-some-amplitude-data.json' } }],
);
```

### View

It is also possible to only use the view part of _waveplayer_ if you are interested in the drawing of waveform data only:

```javascript
import { View } from 'waveplayer';

const view = new View([0.1, -0.4, ...], { 'container': '#container' });

view.progress = 0.5;

view.draw();
```
