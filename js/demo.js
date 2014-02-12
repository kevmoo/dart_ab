// Copyright 2012 Google Inc. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * An abstract class for any Demo of the Box2D library.
 *
 * name is a String
 */
function Demo(name, gravity) {
  /** All of the bodies in a simulation. */
  //List<Body> bodies = new List<Body>();
  this.bodies = [];

  /** The default canvas width and height. */
  //static const int CANVAS_WIDTH = 600;
  //static const int CANVAS_HEIGHT = 600;

  this.CANVAS_WIDTH = 600;
  this.CANVAS_HEIGHT = 600;

  /** Scale of the viewport. */
  //static const double _VIEWPORT_SCALE = 10.0;

  this._VIEWPORT_SCALE = 10.0;

  /** The gravity vector's y value. */
  //static const double GRAVITY = -10.0;

  this.GRAVITY = -10.0;

  /** The timestep and iteration numbers. */
  //static const num TIME_STEP = 1 / 60;
  //static const int VELOCITY_ITERATIONS = 10;
  //static const int POSITION_ITERATIONS = 10;

  this.TIME_STEP = 1 / 60;
  this.VELOCITY_ITERATIONS = 10;
  this.POSITION_ITERATIONS = 10;

  /** The physics world. */
  //final World world;

  this.world = new b2World(gravity, true);

  // For timing the world.step call. It is kept running but reset and polled
  // every frame to minimize overhead.
  //final Stopwatch _stopwatch;

  //final double _viewportScale;

  this._viewportScale = this._VIEWPORT_SCALE;

  /** The drawing canvas. */
  //CanvasElement canvas;

  this.canvas = null;

  /** The canvas rendering context. */
  //CanvasRenderingContext2D ctx;

  this.ctx = null;

  /** The transform abstraction layer between the world and drawing canvas. */
  //ViewportTransform viewport;

  this.viewport = null;

  /** The debug drawing tool. */
  //DebugDraw debugDraw;

  this.debugDraw = null;

  /** Frame count for fps */
  //int frameCount;

  this.frameCount = null;

  /** HTML element used to display the FPS counter */
  //Element fpsCounter;

  this.fpsCounter = null;

  /** Microseconds for world step update */
  //int elapsedUs;

  this.elapsedUs = null;

  /** HTML element used to display the world step time */
  //Element worldStepTime;

  this.worldStepTime = null;

}

Demo.prototype.step = function(timestamp) {
  //_stopwatch.reset();
  var before = performance.now();
  this.world.Step(this.TIME_STEP, this.VELOCITY_ITERATIONS, this.POSITION_ITERATIONS);
  var after = performance.now()
  //this.elapsedUs = _stopwatch.elapsedMicroseconds;
  this.elapsedUs = 1000 * (after - before);

  // Clear the animation panel and draw new frame.
  this.ctx.clearRect(0, 0, this.CANVAS_WIDTH, this.CANVAS_HEIGHT);
  this.ctx.save();
  this.ctx.translate(this.CANVAS_WIDTH / 2, this.CANVAS_HEIGHT / 2);
  this.world.DrawDebugData();
  this.ctx.restore();
  this.frameCount++;

  var that = this;
  window.requestAnimationFrame(function(ts) {
    that.step(ts);
  });
}

/**
 * Starts running the demo as an animation using an animation scheduler.
 */
Demo.prototype.runAnimation = function() {
  var that = this;
  window.requestAnimationFrame(function(ts) {
    that.step(ts);
  });
}

/**
 * Creates the canvas and readies the demo for animation. Must be called
 * before calling runAnimation.
 */
Demo.prototype.initializeAnimation = function() {
    // Setup the canvas.
    this.canvas = document.querySelector('#demo-canvas');
    this.canvas.width = this.CANVAS_WIDTH;
    this.canvas.height = this.CANVAS_HEIGHT;
    this.ctx = this.canvas.getContext("2d");

    // TODO fix?

    // Create the viewport transform with the center at extents.
    //var extents = new b2Vector2(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
    //this.viewport = new CanvasViewportTransform(extents, extents);
    //this.viewport.scale = this._viewportScale;

    //this.ctx.translate(this.CANVAS_WIDTH / 2, this.CANVAS_HEIGHT / 2);

    // Create our canvas drawing tool to give to the world.
    //this.debugDraw = new CanvasDraw(viewport, ctx);

       var debugDraw = new b2DebugDraw();
       debugDraw.SetSprite(this.ctx);
       //debugDraw.SetDrawScale(this._viewportScale);
       debugDraw.SetDrawScale(3);
       debugDraw.SetFillAlpha(0.3);
       debugDraw.SetLineThickness(1.0);
       debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);

    // Have the world draw itself for debugging purposes.
    this.world.SetDebugDraw(debugDraw);

    this.frameCount = 0;
    this.fpsCounter = document.querySelector("#fps-counter");
    this.worldStepTime = document.querySelector("#world-step-time");

    var that = this;

    window.setInterval(function() {
      that.fpsCounter.innerHTML = that.frameCount.toString();
      that.frameCount = 0;
    }, 1000);

    window.setInterval(function() {
      if (that.elapsedUs == null) return;
      that.worldStepTime.innerHTML = (that.elapsedUs / 1000) + " ms";
    }, 200);
  }