'use strict';

var WP = {};

/************
 * MEDIATOR *
 ************/
WP.Mediator = function() {
  this._topics = {};
}

WP.Mediator.prototype = (function() {

  return {

    constructor: WP.Mediator,

    on: function(topic, callback) {
      if (!this._topics.hasOwnProperty(topic))
        this._topics[topic] = [];
      this._topics[topic].push(callback);
      return true;
    },

    un: function(topic, callback) {
      if (!this._topics.hasOwnProperty(topic))
        return false;
      if (callback) {
        for (var i=0; i<this._topics[topic].length; i++) {
          if (this._topics[topic][i] === callback) {
            this._topics[topic].splice(i, 1);
            return true;
          }
        }
      } else {
        delete this._topics[topic];
        return true;
      }
      return false;
    },

    unAll: function() {
      this._topics = null;
    },

    fire: function() {
      var args = Array.prototype.slice.call(arguments),
        topic = args.shift();
      if (!this._topics.hasOwnProperty(topic))
        return false;
      for (var i=0; i<this._topics[topic].length; i++)
        this._topics[topic][i].apply(null, args);
      return true;
    }

  };

})();


/*********************
 * UTILITY FUNCTIONS *
 *********************/
WP.UTILS = {};

// merge default parameters with any that might be supplied by the user
WP.UTILS.extend = function(target) {
  var sources = Array.prototype.slice.call(arguments, 1);
  sources.forEach(function(source) {
    if (typeof source != 'undefined') {   // if no option objects are passed in, skip this step
      Object.getOwnPropertyNames(source).forEach(function(key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }
  });
  return target;
}

WP.UTILS.hex2rgb = function(hex) {
  var bigint = parseInt(hex.charAt(0) == '#' ? hex.substring(1, 7) : hex, 16);
  return { r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: bigint & 255 };
}

WP.UTILS.rgb2hsv = function(rgb) {
  var rr, gg, bb, r = rgb.r/255, g = rgb.g/255, b = rgb.b/255, h, s,
    v = Math.max(r, g, b), diff = v - Math.min(r, g, b),
    diffc = function(c) {
      return (v - c)/6/diff + 1/2;
    };
  if (diff == 0)
    h = s = 0;
  else {
    s = diff/v; rr = diffc(r); gg = diffc(g); bb = diffc(b);
    if (r === v)
      h = bb - gg;
    else if (g === v)
      h = 1/3 + rr - bb;
    else if (b === v)
      h = 2/3 + gg - rr;
    if (h < 0)
      h += 1;
    else if (h > 1)
      h -= 1;
  }
  return { h: Math.round(h*360), s: Math.round(s*100), v: Math.round(v*100) };
}

WP.UTILS.hsv2rgb = function(hsv) {
  if (hsv.s === 0)
    return { r: hsv.v, g: hsv.v, b: hsv.v };
  else {
    var h = hsv.h/60, i = Math.floor(h), s = hsv.s/100, v = hsv.v/100*255,
      data = [v*(1 - s), v*(1 - s*(h - i)), v*(1 - s*(1 - (h - i)))];
    switch (i) {
      case 0:
        return { r: v, g: data[2], b: data[0] };
      case 1:
        return { r: data[1], g: v, b: data[0] };
      case 2:
        return { r: data[0], g: v, b: data[2] };
      case 3:
        return { r: data[0], g: data[1], b: v };
      case 4:
        return { r: data[2], g: data[0], b: v };
      default:
        return { r: v, g: data[0], b: data[1] };
    }
  }
}

WP.UTILS.getJSON = function(url) {
  return new Promise(function(resolve, reject) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.onreadystatechange = function() {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        if (xhr.status === 200)
          resolve(JSON.parse(xhr.responseText));
        else
          reject(new Error(xhr.statusText));
      }
    }
    xhr.send();
  });
}

// convert a generator into a promise resolving state machine
WP.UTILS.stateResolver = function(generatorFunction) {
  return function() {
    var generator = generatorFunction.apply(this, arguments);
    return new Promise(function(resolve, reject) {
      function resume(method, value) {
        try {
          var result = generator[method](value);
          if (result.done)
            resolve(result.value);
          else
            result.value.then(resumeNext, resumeThrow);
        } catch (e) {
          reject(e);
        }
      }
      var resumeNext = resume.bind(null, 'next'),
        resumeThrow = resume.bind(null, 'throw');
      resumeNext();
    });
  }
}
