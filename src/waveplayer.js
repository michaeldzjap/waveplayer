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

'use strict';

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
      me.audioElm.addEventListener('canplay', function() {
        me._mediator.fire('canplay');
        resolve('canplay');
      });

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
      this._mediator.un('waveclicked', this.__onClickHandler);
    this.__onClickHandler = (function(progress) {
      if (!this.isPlaying()) {  // start playback from beginning if waveform is clicked
        this.play();
        this._mediator.fire('waveclickplay');
      } else                  // skip to new position in audio file
        this.skipToSec(progress*this.audioElm.duration);
    }).bind(this);
    this._mediator.on('waveclicked', this.__onClickHandler);
  }

  function _duration2Progress(time) {
    return time/this.audioElm.duration;
  }

  return {
    constructor: WavePlayer,

    // initialize the player
    init: function(options) {
      this.defaultOptions = { };
      this._mediator = new WP.Mediator();

      this._params = WP.UTILS.extend({}, this.defaultOptions, options, {
        mediator: this._mediator   // so we can communicate between the view and the player
      });

      this.waveView = new WaveView(this._params);
    },

    // schedule a playlist
    schedulePlaylist: function(options) {
      var me = this;

      if (this._scheduler)    // cancel current playlist before starting a new one
        this._scheduler = null;

      this._scheduler = WP.UTILS.stateResolver(function* (urls) {
        try {
          for (var i=0; i<urls.length; i++) {
            yield me.load(urls[i]);
            if (i > 0)
              me.play();
            else {
              me._mediator.fire('playlistqueued');
              if (options.onStart)
                options.onStart.call(null);
            }
            yield me.ended();
            if (options.onChange)
              options.onChange.call(null);
          }
          return 'playlistended';
        } catch (err) {
          console.error(err);
        } /*finally {
          console.log('end of generator');
        }*/
      });

      this._scheduler(options.urls).then(
        function(response) {
          console.log(response);
          me._mediator.fire(response);
          if (options.onEnd)
            options.onEnd.call(null, response);
        },
        function(err) {
          console.error(err);
        }
      );
    },

    cancelPlaylist: function() {
      this._scheduler = null;
    },

    // returns a promise which may be used to perform an action when playback finishes
    ended: function() {
      var me = this;
      return new Promise(function(resolve) {
        if (me.__ended)
          me.audioElm.removeEventListener('ended', me.__ended);
        me.__ended = (function(e) {
          me._mediator.fire('ended');
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

    on: function(topic, fn) {
      this._mediator.on(topic, fn);
    },

    un: function(topic, fn) {
      this._mediator.un(topic, fn);
    },

    isPlaying: function() {
      return this.audioElm && !this.audioElm.paused ? true : false;
    },

    play: function() {
      this.audioElm && this.audioElm.play();
    },

    pause: function() {
      this.audioElm && this.audioElm.pause();
    },

    volume: function(val) {
      if (this.audioElm) {
        if (!val)
          return this.audioElm.volume;
        else
          this.audioElm.volume = val;
      }
    },

    interact: function(bool) {
      return this.waveView.interact(bool);
    },

    responsive: function(bool) {
      return this.waveView.responsive(bool);
    },

    skipToSec: function(sec) {
      if (this.audioElm)
        this.audioElm.currentTime = sec;
    },

    destroy: function() {
      this.pause();
      if (this._scheduler)
        this._scheduler = null;
      if (this.audioElm) {
        this.audioElm.removeEventListener('canplay');
        this.audioElm.removeEventListener('error');
        this.audioElm.removeEventListener('timeupdate', this.__timeUpdateHandler);
        if (this.__ended)
          this.audioElm.removeEventListener('ended', this.__ended);
        this._mediator.unAll();
        this.audioElm.parentNode && this.audioElm.parentNode.removeChild(this.audioElm);
        this.audioElm = null;
      }
      this.waveView.destroy();
    }

  };

})();
