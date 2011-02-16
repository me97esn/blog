(function() {
  var font;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  font = false;
  Harry.Flock = (function() {
    Flock.defaults = {
      boids: 100,
      boid: {
        maxSpeed: 2,
        maxForce: 0.05,
        radius: 3,
        mousePhobic: false
      },
      clickToStop: true,
      startPosition: new Harry.Vector(0.5, 0.5),
      frameRate: 20,
      inspectOne: false,
      inspectOneMagnification: false,
      legend: false,
      startOnPageLoad: false,
      antiFlicker: true,
      scale: 1
    };
    function Flock(canvas, options) {
      this.run = __bind(this.run, this);;      this.options = jQuery.extend({}, Flock.defaults, options);
      new Processing(canvas, this.run);
    }
    Flock.prototype.run = function(processing) {
      var boids, inspectorGadget, timeRunning;
      processing.frameRate(this.options.frameRate);
      processing.scale(this.options.scale);
      timeRunning = this.options.startOnPageLoad;
      boids = this._getBoids(processing);
      if (this.options.inspectOne) {
        inspectorGadget = boids[boids.length - 1];
        inspectorGadget.forceInspection = true;
      }
      if (this.options.legend) {
        font || (font = processing.loadFont('/fonts/aller_rg-webfont'));
      }
      processing.draw = __bind(function() {
        var boid, _i, _j, _k, _len, _len2, _len3;
        Harry.Mouse = new Harry.Vector(processing.mouseX, processing.mouseY);
        processing.background(255);
        for (_i = 0, _len = boids.length; _i < _len; _i++) {
          boid = boids[_i];
          boid.renderedThisStep = false;
        }
        if (timeRunning) {
          for (_j = 0, _len2 = boids.length; _j < _len2; _j++) {
            boid = boids[_j];
            boid.step(boids);
          }
        }
        for (_k = 0, _len3 = boids.length; _k < _len3; _k++) {
          boid = boids[_k];
          boid.render(boids);
        }
        if (this.options.inspectOneMagnification && this.options.inspectOne) {
          this._drawInspector(inspectorGadget, processing);
        }
        if (this.options.drawLegend) {
          this._drawLegend(processing);
        }
        return true;
      }, this);
      if (this.options.clickToStop) {
        return processing.mouseClicked = function() {
          var boid, _i, _len;
          for (_i = 0, _len = boids.length; _i < _len; _i++) {
            boid = boids[_i];
            boid.inspectable = timeRunning;
          }
          return timeRunning = !timeRunning;
        };
      }
    };
    Flock.prototype._getBoids = function(processing) {
      var i, options, start, startPosition, velocity, _ref, _results;
      if (this.options.boids.call != null) {
        this.options.boids(processing);
      } else {

      }
      start = new Harry.Vector(processing.width, processing.height).projectOnto(this.options.startPosition);
      options = jQuery.extend({
        processing: processing
      }, this.options.boid);
      _results = [];
      for (i = 1, _ref = this.options.boids; (1 <= _ref ? i <= _ref : i >= _ref); (1 <= _ref ? i += 1 : i -= 1)) {
        velocity = new Harry.Vector(Math.random() * 2 - 1, Math.random() * 2 - 1);
        startPosition = start.copy();
        startPosition.x += Math.random() * 10 - 5;
        startPosition.y += Math.random() * 10 - 5;
        _results.push(new Harry.Boid(jQuery.extend(options, {
          velocity: velocity,
          startPosition: startPosition
        })));
      }
      return _results;
    };
    Flock.prototype._drawLegend = function(processing) {
      var ctx, demo, l, legends, _i, _len;
      processing.fill(255);
      processing.stroke(0);
      processing.strokeWeight(1);
      processing.pushMatrix();
      processing.translate(0, processing.height - 101);
      processing.rect(0, 0, 100, 100);
      processing.textFont(font, 14);
      processing.fill(0);
      processing.text("Legend", 24, 15);
      processing.translate(10, 16);
      demo = new Harry.Vector(0, -12);
      ctx = {
        p: processing
      };
      legends = [
        {
          name: "Velocity",
          r: 0,
          g: 0,
          b: 0
        }, {
          name: "Separation",
          r: 250,
          g: 0,
          b: 0
        }, {
          name: "Alignment",
          r: 0,
          g: 250,
          b: 0
        }, {
          name: "Cohesion",
          r: 0,
          g: 0,
          b: 250
        }
      ];
      processing.pushMatrix();
      processing.strokeWeight(2);
      processing.textFont(font, 12);
      for (_i = 0, _len = legends.length; _i < _len; _i++) {
        l = legends[_i];
        processing.translate(0, 20);
        processing.stroke(l.r, l.g, l.b);
        processing.fill(l.r, l.g, l.b);
        Harry.Boid.prototype._renderVector.call(ctx, demo, 1);
        processing.text(l.name, 8, -2);
      }
      return processing.popMatrix();
    };
    Flock.prototype._drawAntiFlicker = function(processing) {
      processing.stroke(255);
      processing.strokeWeight(this.options.radius + 1);
      processing.noFill();
      return processing.rect(this.options.radius / 2 - 1, this.options.radius / 2 - 1, processing.width - this.options.radius + 1, processing.height - this.options.radius + 1);
    };
    Flock.prototype._drawInspector = function(boid, processing) {
      processing.stroke(0);
      processing.strokeWeight(1);
      processing.fill(255);
      processing.rect(0, 0, 100, 100);
      processing.pushMatrix();
      processing.translate(50, 50);
      processing.scale(2);
      boid._renderSelfWithIndicators(false);
      return processing.popMatrix();
    };
    return Flock;
  })();
}).call(this);
