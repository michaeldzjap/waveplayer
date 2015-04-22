# waveplayer.js

An HTML5 based audio player with a waveform view. The conceptual idea behind waveplayer.js is inspired by [wavesurfer.js](http://www.wavesurfer.fm/) and [waveform.js](http://www.waveformjs.org/), although the actual implementation of it is quite different from both. 

![Screenshot](waveform.png?raw=true "Example")

Author: Michael Dzjaparidze

License: MIT

### Browser Support & Other Requirements
waveplayer.js relies on new ES6 features such as Promises and Generators, and hence, will only work on modern browsers. waveplayer.js is tested to work on Chrome, Firefox, Safari and Opera (no Internet Explorer yet).

waveplayer.js is especially targeted towards the playback and visualisation of larger duration audio files. In order to minimize waveform drawing and audio file loading times, it is necessary to supply an URL to a JSON file representing the waveform of the audio file numerically. This JSON file should be named identically to the corresponding audio file and should exist at the same location. If this JSON file does not exist, an error will be raised.

There exist a number of tools for extracting waveform data in JSON format from an audio file; [wav2json](https://github.com/beschulz/wav2json) or [py-wav2json](https://github.com/michaeldzjap/py-wav2json) can be used for instance. It is enough to provide a single array of floating point values. If the JSON contains an associative array, only the first entree will be used.

### Example 1: load an audio file and play it

Create a waveplayer.js instance and pass in some (optional) options:

```javascript
var waveplayer = new WavePlayer({
  container: '#waveform',
  barWidth: 4,
  barGap: 1,
  height: 128
});
```

Load an audio file from a URL and start playback when loading has finished:

```javascript
waveplayer.load("audio/fm2.mp3")
  .then(function() {
    waveplayer.play();
  });
```

### Example 2: schedule a playlist and play it through from start to finish

Load some audio files from a URL and start playback when loading has finished:

```javascript
waveplayer.schedulePlaylist({
  urls: ["audio/fm2.mp3", "audio/fm3.mp3", "audio/fm7.mp3", "audio/fm8.mp3", "audio/fm13.mp3"],
  onStart: function() {   // optional function to be evaluated when first track has finished loading
    waveplayer.play();
  },
  onChange: function() {  // optional function to be evaluated between playback of consecutive tracks
    console.log("next track will be loaded");
  },
  onEnd: function() {     // optional function to be evaluated when the playlist reached its end
    console.log("playlist is finished");
  }
});
```

View the code for a full playlist example [here](/examples/demo.js)

### waveplayer.js Options

| option | type | default | description |
| --- | --- | --- | --- |
| `barGap` | integer | `1` | Gap between bars in pixels. |
| `barWidth` | integer | `4` | Width of a bar in pixels. |
| `container` | mixed | `null` | **Required**: CSS-selector or HTML-element for displaying the waveform. |
| `data` | array | `null` | An array of floating point values representing waveform amplitudes. Note that it is not required to set this explicitly as an option, although it ultimately needs to be supplied by the user somehow (see the [`load`](#waveplayerjs-methods) method for more information). |
| `height` | integer | `128` | The height of the waveform in pixels. |
| `interact` | boolean | `true` | Enables/disables mouse interaction with the waveform view. This may be changed at any point after creation. |
| `progressColor` | string | `#31708f` | The fill color of the waveform bars that have been played back so far. |
| `responsive` | boolean | `true` | If set to true, the width of the waveform view adapts to the width of the container element. |
| `waveColor` | string | `#428bca` | The fill color of the waveform bars that have not been played back so far. |

### waveplayer.js Methods

* `cancelPlaylist()`

  Cancels the currently active playlist (will also stop the audio instantly). 
  
* `destroy()`
  
  Stops playback, cancels any running playlists and unsubscribes from any events that are listened for.

* `ended()`
  
  Returns a Promise which may be used to perform an action when a track finishes.

* `load()`

  Load an audio file from a URL and return a Promise which may be used to perform an action when the audio file has finished loading.
  
* `interact(bool)`

  Setter or getter for enabling/disabling mouse interaction with the waveform view.
  
  **Arguments**:
  `bool` is an optional boolean value for determining whether mouse interaction with the waveform view should be enabled or disabled.

* `isPlaying()`

  Returns a boolean indicating whether audio is currently playing or not.
  
* `on(topic, fn)`

  Subscribe to an event with a custom event handler.
  
  **Arguments**:
  `topic` is a string denoting a valid event name to which to subscribe.
  
  `fn()` is the callback thay will be evaluated every time the event is fired.
  
* `pause()`

  Pause the currently playing audio file.
  
* `play()`

  Start playback of currently loaded audio file.
  
* `responsive(bool)`

  Setter or getter for enabling/disabling responsive mode for the waveform view. If set, the width of the waveform view will adapt to the width of its parent container element.
  
  **Arguments**:
  `bool` is an optional boolean value for determining whether to switch between a responsive or fixed design of the waveform view.

* `schedulePlaylist(options)`

  Schedules a new playlist.
  
  **Arguments**:
  `options` is an associative array holding the following objects:
    - `urls`: Array of URL's. **Required**
    - `onStart()`: Optional callback function that will be evaluated when first track in playlist has finished loading.
    - `onChange()`: Optional callback function that will be evaluated between playback of consecutive tracks.
    - `onEnd()`: Optional callback function that will be evaluated when the playlist reaches its end.

* `skipToSec(sec)`

  Set the current time in seconds from which to playback audio.
  
  **Arguments**:
  `sec` is a float value denoting the current time from which to playback the audio file.

* `un(topic, fn)`
  
  Unsubscribe a particular callback or from the whole event all together.

  **Arguments**:
  `topic` is a string denoting a valid event name from which to unsubscribe.
  
  `fn()` is an optional callback from which to unsubscribe.
  
* `volume(val)`

  Set or get the audio playback volume, range: `[0 - 1]`.
  
  **Arguments**:
  `val` sets the audio playback volume to this value (if provided, otherwise current set value is returned).
  
### waveplayer.js Events

* `canplay` - Identical to the corresponding [Media event](https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Media_events). Sent when enough data is available so that the media can be played, at least for a couple of frames.
* `ended` - Identical to the corresponding [Media event](https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Media_events). Sent when playback of an audio file is completed.
* `playlistended` - Sent when the playlist has finished playing all the queued audio.
* `playlistqueued` - Sent when the the first audio file in the playlist has finished loading.
* `waveclicked` - Sent when the user clicks somewhere on the waveform. Callback will receive a float denoting the progress `[0..1]`.
* `waveclickplay` - Sent when the user initiates playback by clicking on the waveform view with the mouse.
