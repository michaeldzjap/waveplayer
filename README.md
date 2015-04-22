# waveplayer.js

An HTML5 based audio player with a waveform view.

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
