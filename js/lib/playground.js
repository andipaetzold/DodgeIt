/*     
  Playground 1.20
  http://canvasquery.org
  (c) 2012-2014 http://rezoner.net
  Playground may be freely distributed under the MIT license.

*/

function playground(args) {
  return new Playground(args);
};

/* utitlities */

playground.extend = function() {
  for (var i = 1; i < arguments.length; i++) {
    for (var j in arguments[i]) {
      arguments[0][j] = arguments[i][j];
    }
  }

  return arguments[0];
};

playground.throttle = function(fn, threshold) {
  threshold || (threshold = 250);
  var last,
    deferTimer;
  return function() {
    var context = this;

    var now = +new Date,
      args = arguments;
    if (last && now < last + threshold) {
      // hold on to it
      clearTimeout(deferTimer);
      deferTimer = setTimeout(function() {
        last = now;
        fn.apply(context, args);
      }, threshold);
    } else {
      last = now;
      fn.apply(context, args);
    }
  };
};

/* constructor */

function Playground(args) {

  /* defaults */

  playground.extend(this, {
    smoothing: 1,
    scale: 1,
    preventContextMenu: true
  }, args);


  if (!this.width || !this.height) this.fitToContainer = true;

  if (!this.container) this.container = document.body;
  if (this.container !== document.body) this.customContainer = true;
  if (typeof this.container === "string") this.container = document.querySelector(this.container);

  /* state */

  this.state = {};

  /* layer */

  if (!args.layer) {
    cq.smoothing = this.smoothing;

    if (navigator.isCocoonJS) {
      this.layer = cq.cocoon(1, 1);
      this.layer.appendTo(this.container);
      this.screen = this.layer;
    } else {
      this.layer = cq(1, 1);
      if (this.scaleToFit) {
        this.screen = cq(1, 1);
        this.screen.appendTo(this.container);
      } else {
        this.layer.appendTo(this.container);
        this.screen = this.layer;
      }
    }

  }

  var canvas = this.screen.canvas;

  /* events */

  this.eventsHandler = this.eventsHandler.bind(this);

  /* mouse */

  this.mouse = new playground.Mouse(canvas);
  this.mouse.on("event", this.eventsHandler);

  this.mouse.preventContextMenu = this.preventContextMenu;

  /* touch */

  this.touch = new playground.Touch(canvas);
  this.touch.on("event", this.eventsHandler);

  /* window resize */

  window.addEventListener("resize", this.resizeHandler.bind(this));

  setTimeout(this.resizeHandler.bind(this), 1);

  /* game loop */

  var self = this;

  var lastTick = Date.now();

  function step() {

    requestAnimationFrame(step);

    var delta = Date.now() - lastTick;
    lastTick = Date.now();

    if (delta > 1000) return;

    var dt = delta / 1000;

    if (self.loader.count <= 0) {

      if (self.step) self.step(dt);
      if (self.state.step) self.state.step(dt);

      if (self.render) self.render(dt);
      if (self.state.render) self.state.render(dt);

      if (self.postrender) self.postrender(dt);
      if (self.state.postrender) self.state.postrender(dt);

    } else {
      self.renderLoader(dt);
    }

    if (self.scaleToFit) {
      self.screen.save();
      self.screen.translate(self.offsetX, self.offsetY);
      self.screen.scale(self.scale, self.scale);
      // self.layer.drawImage(self.scanlines.canvas, 0, 0);
      self.screen.drawImage(self.layer.canvas, 0, 0);
      self.screen.restore();
    }

  };

  requestAnimationFrame(step);

  /* assets */

  /* default audio format */

  var canPlayMp3 = (new Audio).canPlayType("audio/mp3");
  var canPlayOgg = (new Audio).canPlayType('audio/ogg; codecs="vorbis"');

  if (canPlayMp3) this.audioFormat = "mp3";
  else this.audioFormat = "ogg";

  this.loader = new playground.Loader();

  this.images = {};

  var audioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext;

  if (audioContext) {
    this.sound = new Playground.Sound(this);
  } else {
    this.sound = new Playground.SoundFallback(this);
  }

  this.loadFoo(0.5);

  if (this.create) setTimeout(this.create.bind(this));

  this.loader.on("ready", function() {
    if (self.ready) self.ready();

    self.ready = function() {};
  });



};

Playground.prototype = {

  setState: function(state) {
    state.app = this;

    if (this.state && this.state.leave) this.state.leave();

    this.state = state;

    if (this.state && this.state.enter) this.state.enter();
  },

  eventsHandler: function(event, data) {

    if (this[event]) this[event](data);
    if (this.state.proxy) this.state.proxy(event, data);
    if (this.state[event]) this.state[event](data);

  },

  resizeHandler: function() {

    if (this.customContainer) {
      var containerWidth = this.container.offsetWidth;
      var containerHeight = this.container.offsetHeight;
    } else {
      var containerWidth = window.innerWidth;
      var containerHeight = window.innerHeight;
    }

    if (this.fitToContainer) {
      this.width = this.containerWidth;
      this.height = this.containerHeight;
    }

    if (!this.scaleToFit) {

      if (this.fitToContainer) {
        this.width = containerWidth;
        this.height = containerHeight;
      }

      this.offsetX = 0;
      this.offsetY = 0;

    } else {

      this.screen.width = containerWidth;
      this.screen.height = containerHeight;

      this.scale = Math.min(containerWidth / this.width, containerHeight / this.height);

      if (this.roundScale) this.scale = Math.max(1, Math.floor(this.scale));

      this.offsetX = containerWidth / 2 - this.scale * (this.width / 2) | 0;
      this.offsetY = containerHeight / 2 - this.scale * (this.height / 2) | 0;

      this.mouse.scale = this.scale;
      this.mouse.offsetX = this.offsetX;
      this.mouse.offsetY = this.offsetY;

      this.touch.scale = this.scale;
      this.touch.offsetX = this.offsetX;
      this.touch.offsetY = this.offsetY;
    }

    this.layer.width = this.width;
    this.layer.height = this.height;

    this.center = {
      x: this.width / 2 | 0,
      y: this.height / 2 | 0
    };

    this.screen.clear("#000");

    this.eventsHandler("resize");

    this.mouse.update();
    this.touch.update();
  },

  renderLoader: function() {

    var height = this.height / 10 | 0;
    var x = 32;
    var width = this.width - x * 2;
    var y = this.height / 2 - height / 2 | 0;

    this.layer.clear("#000");
    this.layer.strokeStyle("#fff").lineWidth(2).strokeRect(x, y, width, height);
    this.layer.fillStyle("#fff").fillRect(x, y, width * this.loader.progress | 0, height);

  },

  /* imaginary timeout to delay loading */

  loadFoo: function(timeout) {
    if (!this.foofooLoader) this.foofooLoader = 0;

    var loader = this.loader;

    this.loader.add("foo " + timeout);

    setTimeout(function() {
      loader.ready("foo " + timeout);
    }, (this.foofooLoader += timeout * 1000));

  },

  /* images */

  loadImages: function() {

    for (var i = 0; i < arguments.length; i++) {

      var arg = arguments[i];

      /* polymorphism at its finest */

      if (typeof arg === "object") {

        for (var key in arg) this.addImages(arg[key]);

      } else {

        /* if argument is not an object/array let's try to load it */

        var filename = arg;

        var loader = this.loader;

        var fileinfo = filename.match(/(.*)\..*/);
        var key = fileinfo ? fileinfo[1] : filename;

        /* filename defaults to png */

        if (!fileinfo) filename += ".png";

        var path = "images/" + filename;

        this.loader.add(path);

        var image = this.images[key] = new Image;

        image.addEventListener("load", function() {
          loader.ready(path);
        });

        image.addEventListener("error", function() {
          loader.error(path);
        });

        image.src = path;
      }
    }
  },

  /* sounds */

  loadSounds: function() {

    for (var i = 0; i < arguments.length; i++) {

      var arg = arguments[i];

      /* polymorphism at its finest */

      if (typeof arg === "object") {

        for (var key in arg) this.loadSounds(arg[key]);

      } else {
        this.sound.load(arg);
      }
    }

  },

  loadFont: function(name) {
    var styleNode = document.createElement("style");
    styleNode.type = "text/css";

    var formats = {
      "woff": "woff",
      "ttf": "truetype"
    };

    var sources = "";

    for (var ext in formats) {
      var type = formats[ext];
      sources += " url(\"fonts/" + name + "." + ext + "\") format('" + type + "');"
    }

    styleNode.textContent = "@font-face { font-family: '" + name + "'; src: " + sources + " }";

    document.head.appendChild(styleNode);

    var layer = cq(32, 32);

    layer.font("10px huj");
    layer.fillText(16, 16, 16).trim();

    var width = layer.width;
    var height = layer.height;

    this.loader.add("font " + name);

    var self = this;

    function check() {
      var layer = cq(32, 32);
      layer.font("10px " + name).fillText(16, 16, 16);
      layer.trim();

      if (layer.width !== width || layer.height !== height) {
        self.loader.ready("font " + name);
      } else {
        setTimeout(check, 250);
      }
    };

    check();
  },

  playSound: function(key, loop) {

    if (!this.audioChannels) {
      this.audioChannels = [];

      for (var i = 0; i < 16; i++) this.audioChannels.push(new Audio);

      this.audioChannelIndex = 0;
    }

    return this.sound.play(key, loop);

  },

  stopSound: function(sound) {
    this.sound.stop(sound);
  }


};

playground.Events = function() {

  this.listeners = {};

};

playground.Events.prototype = {

  on: function(event, callback) {
    if (!this.listeners[event]) this.listeners[event] = [];

    this.listeners[event].push(callback);

    return callback;
  },

  once: function(event, callback) {
    callback.once = true;

    if (!this.listeners[event]) this.listeners[event] = [];

    this.listeners[event].push(callback);

    return callback;
  },

  off: function(event, callback) {
    for (var i = 0, len = this.listeners[event].length; i < len; i++) {
      if (this.listeners[event][i]._remove) {
        this.listeners[event].splice(i--, 1);
        len--;
      }
    }
  },

  trigger: function(event, data) {

    /* if you prefer events pipe */

    if (this.listeners["event"]) {
      for (var i = 0, len = this.listeners["event"].length; i < len; i++) {
        this.listeners["event"][i](event, data);
      }
    }

    /* or subscribed to single event */

    if (this.listeners[event]) {
      for (var i = 0, len = this.listeners[event].length; i < len; i++) {
        var listener = this.listeners[event][i];
        listener(data);

        if (listener.once) {
          this.listeners[event].splice(i--, 1);
        }
      }
    }
  }
};

/* Mouse */

playground.Mouse = function(element) {

  var self = this;

  playground.Events.call(this);

  this.element = element;

  this.buttons = {};

  this.mousemoveEvent = {};
  this.mousedownEvent = {};
  this.mouseupEvent = {};
  this.mousewheelEvent = {};

  this.x = 0;
  this.y = 0;

  this.offsetX = 0;
  this.offsetY = 0;
  this.scale = 1;

  element.addEventListener("mousemove", this.mousemove.bind(this));
  element.addEventListener("mousedown", this.mousedown.bind(this));
  element.addEventListener("mouseup", this.mouseup.bind(this));

  this.enableMousewheel();

  this.element.addEventListener("contextmenu", function(e) {
    if (self.preventContextMenu) e.preventDefault();
  });

  element.requestPointerLock = element.requestPointerLock ||
    element.mozRequestPointerLock ||
    element.webkitRequestPointerLock;

  document.exitPointerLock = document.exitPointerLock ||
    document.mozExitPointerLock ||
    document.webkitExitPointerLock;
};

playground.Mouse.prototype = {

  lock: function() {
    this.locked = true;
    this.element.requestPointerLock();
  },

  release: function() {
    this.locked = false;
    document.exitPointerLock();
  },

  getElementOffset: function(element) {

    var offsetX = 0;
    var offsetY = 0;

    do {
      offsetX += element.offsetLeft;
      offsetY += element.offsetTop;
    }

    while ((element = element.offsetParent));

    return {
      x: offsetX,
      y: offsetY
    };

  },

  update: function() {
    this.elementOffset = this.getElementOffset(this.element);
  },

  mousemove: playground.throttle(function(e) {
    this.x = this.mousemoveEvent.x = (e.pageX - this.elementOffset.x - this.offsetX) / this.scale | 0;
    this.y = this.mousemoveEvent.y = (e.pageY - this.elementOffset.y - this.offsetY) / this.scale | 0;

    this.mousemoveEvent.original = e;

    if (this.locked) {
      this.mousemoveEvent.movementX = e.movementX ||
        e.mozMovementX ||
        e.webkitMovementX ||
        0;

      this.mousemoveEvent.movementY = e.movementY ||
        e.mozMovementY ||
        e.webkitMovementY ||
        0;
    }


    this.trigger("mousemove", this.mousemoveEvent);
  }, 16),

  mousedown: function(e) {

    var buttonName = ["left", "middle", "right"][e.button];

    this.mousedownEvent.x = this.mousemoveEvent.x;
    this.mousedownEvent.y = this.mousemoveEvent.y;
    this.mousedownEvent.button = buttonName;
    this.mousedownEvent.original = e;

    this[buttonName] = true;

    this.trigger("mousedown", this.mousedownEvent);
  },

  mouseup: function(e) {

    var buttonName = ["left", "middle", "right"][e.button];

    this.mouseupEvent.x = this.mousemoveEvent.x;
    this.mouseupEvent.y = this.mousemoveEvent.y;
    this.mouseupEvent.button = buttonName;
    this.mouseupEvent.original = e;

    this[buttonName] = false;

    this.trigger("mouseup", this.mouseupEvent);
  },

  mousewheel: function(e) {
    this.mousewheelEvent.x = this.mousemoveEvent.x;
    this.mousewheelEvent.y = this.mousemoveEvent.y;
    this.mousewheelEvent.button = ["none", "left", "middle", "right"][e.button];
    this.mousewheelEvent.original = e;

    this[e.button] = false;

    this.trigger("mousewheel", this.mousewheelEvent);
  },


  enableMousewheel: function() {

    var eventNames = 'onwheel' in document || document.documentMode >= 9 ? ['wheel'] : ['mousewheel', 'DomMouseScroll', 'MozMousePixelScroll'];
    var callback = this.mousewheel.bind(this);
    var self = this;

    for (var i = eventNames.length; i;) {

      self.element.addEventListener(eventNames[--i], playground.throttle(function(event) {

        var orgEvent = event || window.event,
          args = [].slice.call(arguments, 1),
          delta = 0,
          deltaX = 0,
          deltaY = 0,
          absDelta = 0,
          absDeltaXY = 0,
          fn;
        event.type = "mousewheel";

        // Old school scrollwheel delta
        if (orgEvent.wheelDelta) {
          delta = orgEvent.wheelDelta;
        }

        if (orgEvent.detail) {
          delta = orgEvent.detail * -1;
        }

        // New school wheel delta (wheel event)
        if (orgEvent.deltaY) {
          deltaY = orgEvent.deltaY * -1;
          delta = deltaY;
        }

        // Webkit
        if (orgEvent.wheelDeltaY !== undefined) {
          deltaY = orgEvent.wheelDeltaY;
        }

        var result = delta ? delta : deltaY;

        self.mousewheelEvent.x = self.mousemoveEvent.x;
        self.mousewheelEvent.y = self.mousemoveEvent.y;
        self.mousewheelEvent.delta = result / Math.abs(result);
        self.mousewheelEvent.original = orgEvent;

        callback(self.mousewheelEvent);

        event.preventDefault();

      }, 40), false);
    }

  }

};

playground.extend(playground.Mouse.prototype, playground.Events.prototype);

/* Touch */

playground.Touch = function(element) {

  playground.Events.call(this);

  this.element = element;

  this.buttons = {};

  this.touchmoveEvent = {};
  this.touchstartEvent = {};
  this.touchendEvent = {};

  this.touches = {};

  this.x = 0;
  this.y = 0;

  this.offsetX = 0;
  this.offsetY = 0;
  this.scale = 1;

  element.addEventListener("touchmove", this.touchmove.bind(this));
  element.addEventListener("touchstart", this.touchstart.bind(this));
  element.addEventListener("touchend", this.touchend.bind(this));
};

playground.Touch.prototype = {

  getElementOffset: function(element) {

    var offsetX = 0;
    var offsetY = 0;

    do {
      offsetX += element.offsetLeft;
      offsetY += element.offsetTop;
    }

    while ((element = element.offsetParent));

    return {
      x: offsetX,
      y: offsetY
    };

  },

  update: function() {
    this.elementOffset = this.getElementOffset(this.element);
  },

  touchmove: function(e) {
    for (var i = 0; i < e.changedTouches.length; i++) {

      var touch = e.changedTouches[i];

      this.x = this.touchmoveEvent.x = (touch.pageX - this.elementOffset.x - this.offsetX) / this.scale | 0;
      this.y = this.touchmoveEvent.y = (touch.pageY - this.elementOffset.y - this.offsetY) / this.scale | 0;

      this.touchmoveEvent.original = touch;
      this.touchmoveEvent.id = touch.identifier;

      this.touches[touch.identifier].x = this.touchmoveEvent.x;
      this.touches[touch.identifier].y = this.touchmoveEvent.y;

      this.trigger("touchmove", this.touchmoveEvent);

      e.preventDefault();
    }
  },

  touchstart: function(e) {

    for (var i = 0; i < e.changedTouches.length; i++) {

      var touch = e.changedTouches[i];

      this.x = this.touchstartEvent.x = (touch.pageX - this.elementOffset.x - this.offsetX) / this.scale | 0;
      this.y = this.touchstartEvent.y = (touch.pageY - this.elementOffset.y - this.offsetY) / this.scale | 0;

      this.touchstartEvent.original = e.touch;
      this.touchstartEvent.id = touch.identifier;

      this.touches[touch.identifier] = {
        x: this.touchstartEvent.x,
        y: this.touchstartEvent.y
      };

      this.pressed = true;

      this.trigger("touchstart", this.touchstartEvent);
    }

  },

  touchend: function(e) {
    for (var i = 0; i < e.changedTouches.length; i++) {

      var touch = e.changedTouches[i];

      this.touchendEvent.x = this.touchmoveEvent.x;
      this.touchendEvent.y = this.touchmoveEvent.y;

      this.touchendEvent.original = touch;
      this.touchendEvent.id = touch.identifier;

      delete this.touches[touch.identifier];

      this.pressed = false;

      this.trigger("touchend", this.touchendEvent);

    }

  }

};

playground.extend(playground.Touch.prototype, playground.Events.prototype);

/* Loader */

playground.Loader = function() {

  playground.Events.call(this);

  this.reset();

};

playground.Loader.prototype = {

  /* loader */

  add: function(id) {
    this.queue++;
    this.count++;
    this.trigger("add", id);
  },

  error: function(id) {
    console.log("unable to load " + id);
    this.trigger("error", id);
  },

  ready: function(id) {
    this.queue--;

    this.progress = 1 - this.queue / this.count;

    this.trigger("load", id);

    if (this.queue <= 0) {
      this.trigger("ready");
      this.reset();
    }
  },

  reset: function() {
    this.progress = 0;
    this.queue = 0;
    this.count = 0;
  }
};

playground.extend(playground.Loader.prototype, playground.Events.prototype);

CanvasQuery.Layer.prototype.playground = function(args) {
  args.layer = this;
  return playground(args);
};

Playground.SoundInterface = {

};

Playground.Sound = function(parent) {

  this.parent = parent;

  var canPlayMp3 = (new Audio).canPlayType("audio/mp3");
  var canPlayOgg = (new Audio).canPlayType('audio/ogg; codecs="vorbis"');

  if (canPlayMp3) this.audioFormat = "mp3";
  else this.audioFormat = "ogg";

  var audioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext;

  this.context = new audioContext;

  this.gainNode = this.context.createGain()
  this.gainNode.connect(this.context.destination);

  this.compressor = this.context.createDynamicsCompressor();
  this.compressor.connect(this.gainNode);

  this.output = this.gainNode;

  this.gainNode.gain.value = 1.0;

  this.buffers = [];
  this.pool = [];
  this.volume = 1.0;

  this.setMasterPosition(0, 0, 0);

};

Playground.Sound.prototype = {

  setMaster: function(volume) {

    this.volume = volume;

    this.gainNode.gain.value = volume;

  },

  load: function(file) {

    var url = "sounds/" + file + "." + this.audioFormat;
    var sampler = this;

    var request = new XMLHttpRequest();

    request.open("GET", url, true);
    request.responseType = "arraybuffer";

    var id = this.parent.loader.add();

    request.onload = function() {

      sampler.context.decodeAudioData(this.response, function(decodedBuffer) {
        sampler.buffers[file] = decodedBuffer;
        sampler.parent.loader.ready(id);
      });

    }

    request.send();

  },

  cleanArray: function(array, property) {
    for (var i = 0, len = array.length; i < len; i++) {
      if (array[i] === null || (property && array[i][property])) {
        array.splice(i--, 1);
        len--;
      }
    }
  },

  setMasterPosition: function(x, y, z) {

    this.masterPosition = {
      x: x,
      y: y,
      z: z
    };

    this.context.listener.setPosition(x, y, z)
      // this.context.listener.setOrientation(0, 0, -1, 0, 1, 0);
      // this.context.listener.dopplerFactor = 1;
      // this.context.listener.speedOfSound = 343.3;
  },

  getSoundBuffer: function() {
    if (!this.pool.length) {
      for (var i = 0; i < 100; i++) {

        var buffer, gain, panner;

        var nodes = [
          buffer = this.context.createBufferSource(),
          gain = this.context.createGain(),
          panner = this.context.createPanner()
        ];

        panner.distanceModel = "linear";

        // 1 - rolloffFactor * (distance - refDistance) / (maxDistance - refDistance)
        // refDistance / (refDistance + rolloffFactor * (distance - refDistance))
        panner.refDistance = 1;
        panner.maxDistance = 600;
        panner.rolloffFactor = 1.0;


        // panner.setOrientation(-1, -1, 0);

        this.pool.push(nodes);

        nodes[0].connect(nodes[1]);
        // nodes[1].connect(nodes[2]);
        nodes[1].connect(this.output);
      }
    }

    return this.pool.pop();
  },

  play: function(name, loop) {

    var nodes = this.getSoundBuffer();

    bufferSource = nodes[0];
    bufferSource.gainNode = nodes[1];
    bufferSource.pannerNode = nodes[2];
    bufferSource.buffer = this.buffers[name];
    bufferSource.loop = loop || false;
    bufferSource.key = name;

    if (this.loop) {
      //  bufferSource.loopStart = this.loopStart;
      // bufferSource.loopEnd = this.loopEnd;
    }

    bufferSource.gainNode.gain.value = 1.0;

    bufferSource.start(0);

    bufferSource.volumeLimit = 1;

    this.setPosition(bufferSource, this.masterPosition.x, this.masterPosition.y, this.masterPosition.z);


    return bufferSource;
  },

  stop: function(what) {

    if (!what) return;

    what.stop(0);

  },

  setPlaybackRate: function(sound, rate) {

    if (!sound) return;

    return sound.playbackRate.value = rate;
  },

  setPosition: function(sound, x, y, z) {

    if (!sound) return;

    sound.pannerNode.setPosition(x, y || 0, z || 0);
  },

  setVelocity: function(sound, x, y, z) {

    if (!sound) return;

    sound.pannerNode.setPosition(x, y || 0, z || 0);

  },

  setVolume: function(sound, volume) {

    if (!sound) return;

    return sound.gainNode.gain.value = Math.max(0, volume);
  }

};

playground.extend(Playground.Sound.prototype, Playground.SoundInterface);

Playground.SoundFallback = function(parent) {

  this.parent = parent;

  var canPlayMp3 = (new Audio).canPlayType("audio/mp3");
  var canPlayOgg = (new Audio).canPlayType('audio/ogg; codecs="vorbis"');

  if (canPlayMp3) this.audioFormat = "mp3";
  else this.audioFormat = "ogg";

  this.samples = {};

};

Playground.SoundFallback.prototype = {

  setMaster: function(volume) {

    this.volume = volume;

  },

  setPosition: function(x, y, z) {
    return;
  },

  load: function(file) {

    var filename = arg;

    var loader = this.parent.loader;

    var key = filename;

    filename += "." + this.audioFormat;

    var path = "sounds/" + filename;

    this.loader.add(path);

    var audio = this.samples[key] = new Audio;

    audio.addEventListener("canplay", function() {
      loader.ready(path);
    });

    audio.addEventListener("error", function() {
      loader.error(path);
    });

    audio.src = path;


  },

  play: function(key, loop) {

    var sound = this.sounds[key];

    sound.currentTime = 0;
    sound.loop = loop;
    sound.play();

    return sound;

  },

  stop: function(what) {

    if (!what) return;

    what.pause();

  },

  setPlaybackRate: function(sound, rate) {

    return;
  },

  setVolume: function(sound, volume) {

    sound.volume = volume * this.volume;

  }

};

playground.extend(Playground.SoundFallback.prototype, Playground.SoundInterface);