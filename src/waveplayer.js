/*
 * waveplayer.js
 *
 * © Michaël Dzjaparidze 2015
 * http://www.michaeldzjaparidze.com, https://github.com/michaeldzjap
 *
 * A HTML5 based audio player with a waveform view
 *
 * This work is licensed under the MIT License (MIT)
 */

function WavePlayer() {
  this.init.apply(this, arguments);
}

WavePlayer.prototype = (function() {

  function _loadAudioElm(url) {
    var me = this;
    return new Promise(function(resolve, reject) {
      // create a new audio element for every new load request
      if (me.waveView.container.querySelector('audio'))
        me.waveView.container.removeChild(me.audioElm);
      me.audioElm = document.createElement('audio');
      me.audioElm.controls = false;
      me.audioElm.autoplay = false;
      me.audioElm.preload = 'auto';
      me.waveView.container.appendChild(me.audioElm);
      me.audioElm.addEventListener('canplay', resolve('canplay'));

      me.audioElm.addEventListener('error', function(e) {
        switch (e.target.error.code) {
          case e.target.error.MEDIA_ERR_ABORTED:
            reject(new Error('Fetching process aborted by user'));
            break;
          case e.target.error.MEDIA_ERR_NETWORK:
            reject(new Error('There was a problem downloading the audio file'));
            break;
          case e.target.error.MEDIA_ERR_DECODE:
            reject(new Error('There was a problem decoding the audio file'));
            break;
          case e.target.error.MEDIA_ERR_SRC_NOT_SUPPORTED:
            reject(new Error('Audio is not supported, check the provided URL'));
            break;
          default:
            reject('An unknown error occurred');
            break;
        }
      });

      me.audioElm.addEventListener('timeupdate', function(e) {
        me.waveView.updateWave(_duration2Progress.call(me, e.target.currentTime));
      });

      me.audioElm.src = url;
      me.audioElm.load();
    });
  }

  function _getWaveformData(url) {
    var me = this;
    return new Promise(function(resolve, reject) {
      WP.UTILS.getJSON(url.substr(0, url.lastIndexOf('.')) + '.json')
        .then(function(response) {
          if (typeof response === 'object')
            me.waveView.drawWave(response[Object.keys(response)[0]], 0);
          else
            me.waveView.drawWave(response, 0);
          resolve('jsonfetched');
        })
        .catch(function(err) {
          reject(err);
        });
    });
  }

  function _mediatorHandler() {
    if (this.__onClickHandler)
      this._mediator.un('click', this.__onClickHandler);
    this.__onClickHandler = (function(progress) {
      if (!this.isPlaying())  // start playback from beginning if waveform is clicked
        this.play();
      else                  // skip to new position in audio file
        this.skipToSec(progress*this.audioElm.duration);
    }).bind(this);
    this._mediator.on('click', this.__onClickHandler);
  }

  function _duration2Progress(time) {
    return time/this.audioElm.duration;
  }

  return {
    constructor: WavePlayer,

    // initialize the player
    init: function(options) {
      this.defaultOptions = {
        repeat: false,
        onEnd: null
      };
      this._mediator = new WP.Mediator();

      this._params = WP.UTILS.extend({}, this.defaultOptions, options, {
        mediator: this._mediator   // so we can communicate between the view and the player
      });

      this.waveView = new WaveView(this._params);
    },

    // schedule a playlist
    schedulePlaylist: function(options) {
      var me = this;
      var scheduler = WP.UTILS.stateResolver(function* (urls) {
        try {
          for (var i=0; i<urls.length; i++) {
            yield me.load(urls[i]);
            if (i > 0)
              me.play();
            else if (options.onStart)
              options.onStart.call(me);
            yield me.ended();
          }
          return 'ended';
        } catch (err) {
          console.error(err);
        } /*finally {
          console.log('end of generator');
        }*/
      });

      scheduler(options.urls).then(
        function(response) {
          if (options.onEnd)
            options.onEnd.call(me, response);
        },
        function(err) {
          console.error(err);
        }
      );
    },

    // returns a promise which may be used to perform an action when playback finishes
    ended: function() {
      var me = this;
      return new Promise(function(resolve) {
        if (me.__ended)
          me.audioElm.removeEventListener('ended', me.__ended);
        me.__ended = (function(e) {
          resolve('ended');
        }).bind(me);
        me.audioElm.addEventListener('ended', me.__ended);
      });
    },

    // load a track and return a promise which may be used to perform an action when track has finished loading
    load: function(url) {
      var me = this;
      return Promise.all(
        [
          Promise.resolve(_loadAudioElm.call(this, url))
            .then(function(response) {
              _mediatorHandler.call(me);
              return response;
            }),
          _getWaveformData.call(this, url)
        ]
      );
    },

    isPlaying: function() {
      return !this.audioElm.paused;
    },

    play: function(fn) {
      this.audioElm.play();
    },

    pause: function() {
      this.audioElm.pause();
    },

    volume: function(val) {
      if (!val)
        return this.audioElm.volume;
      else
        this.audioElm.volume = val;
    },

    interact: function(bool) {
      return this.waveView.interact(bool);
    },

    responsive: function(bool) {
      return this.waveView.responsive(bool);
    },

    skipToSec: function(sec) {
      this.audioElm.currentTime = sec;
    },

    destroy: function() {
      this.pause();
      this.audioElm.removeEventListener('canplay');
      this.audioElm.removeEventListener('error');
      this.audioElm.removeEventListener('timeupdate', this.__timeUpdateHandler);
      if (this.__ended)
        this.audioElm.removeEventListener('ended', this.__ended);
      this._mediator.unAll();
      this.audioElm.parentNode && this.audioElm.parentNode.removeChild(this.audioElm);
      this.audioElm = null;
      this.waveView.destroy();
    }

  };

})();
