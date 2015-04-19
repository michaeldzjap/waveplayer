# waveplayer.js

An HTML5 based audio player with a waveform view.

![Screenshot](waveform.png?raw=true "Example")

Author: Michael Dzjaparidze

License: MIT

### Browser Support & Other Requirements
waveplayer.js relies on new ES6 features such as Promises and Generators. Hence, it will only work on modern browsers supporting this. Furthermore waveplayer.js has only been tested to work on Chrome, Firefox, Safari and Opera (no Internet Explorer yet).

waveplayer.js is especially targeted towards the playback and visualisation of larger duration audio files. In order to minimize waveform drawing and audio file loading times, it is necessary to supply an URL to a JSON file representing the waveform of the audio file numerically. This JSON file should be named identically to the corresponding audio file and should exist at the same location. If this JSON file does not exist, an error will be raised. 

There exist a number of tools for extracting waveform data in JSON format from an audio file; [wav2json](https://github.com/beschulz/wav2json) or [py-wav2json](https://github.com/michaeldzjap/py-wav2json) can be used for instance. It is enough to provide a single array of floating point values. If the JSON contains an associative array, only the first entree will be used. 

### Examples
