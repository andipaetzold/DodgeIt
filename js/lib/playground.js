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

  this.loader = new playground.Loader();

  this.images = {};

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
    }

    this.layer.width = this.width;
    this.layer.height = this.height;

    this.center = {
      x: this.width / 2 | 0,
      y: this.height / 2 | 0
    };

    this.screen.clear("#000");

    this.eventsHandler("resize");
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