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

function MixerTest(ballFixture) {
  //final FixtureDef _ballFixture;
  this._ballFixture = ballFixture;
  Demo.call(this, "Mixer test", new b2Vec2(0.0, -30.0), 5.0);

  // TODO(kevmoo) all of these fields should move to the top
  this._QUEUE_SIZE = 100;
  //final List<Body> _bouncers = new List<Body>();
  this._bouncers = [];
  //final Queue<num> _stepTimes = new Queue<num>();
  this._stepTimes = [];
  //final SplayTreeMap<int, int> _counts = new SplayTreeMap<int, int>();
  this._counts = {};

  this._stepCounter = 0;
  this._fastFrameCount = 0;
  this._lastUpdate = 0;
  this._stepTimeRunningAverage = 0;
}

MixerTest.prototype = Object.create(Demo.prototype);
MixerTest.prototype.constructor = MixerTest;

MixerTest.prototype.initialize = function() {
  var sd = new b2PolygonShape();
  sd.SetAsBox(50.0, 0.4);

  var bd = new b2BodyDef();
  bd.position.x = 0.0;
  bd.position.y = 0.0;
  //assert (world != null);

  //
  // Rotating thing
  //

  var numPieces = 6;
  var radius = 50;
  bd = new b2BodyDef();
  bd.type = b2Body.b2_dynamicBody;
  var body = this.world.CreateBody(bd);

  for (var i = 0; i < numPieces; i++) {
    var angle = 2 * Math.PI * (i / numPieces);

    var xPos = radius * Math.cos(angle);
    var yPos = radius * Math.sin(angle);

    var cd = new b2PolygonShape();
    //cd.SetAsBoxWithCenterAndAngle(1.0, 30.0, new b2Vec2(xPos, yPos), angle);
    cd.SetAsOrientedBox(1.0, 30.0, new b2Vec2(xPos, yPos), angle);

    var fd = new b2FixtureDef();
    fd.shape = cd;
    fd.density = 10.0;
    fd.friction = 0.0;
    fd.restitution = 0.0;

    body.CreateFixture(fd);
  }

  body.bullet = false;

  // Create an empty ground body.
  var bodyDef = new b2BodyDef();
  var groundBody = this.world.CreateBody(bodyDef);

  var rjd = new b2RevoluteJointDef();
  //rjd.Initialize(body, groundBody, body.position);
  rjd.Initialize(body, groundBody, body.GetWorldCenter());
  rjd.motorSpeed = 0.8;
  rjd.maxMotorTorque = 100000000.0;
  rjd.enableMotor = true;

  this.world.CreateJoint(rjd);
}

MixerTest.prototype._addItem = function() {
  var bd2 = new b2BodyDef();
  bd2.type = b2Body.b2_dynamicBody;
  bd2.position = new b2Vec2(0.0, 40.0);
  bd2.linearVelocity = new b2Vec2(35.0, 0.0);

  var ball = this.world.CreateBody(bd2);
  ball.CreateFixture(this._ballFixture);

  this._bouncers.push(ball);
}

MixerTest.prototype._doStats = function() {
  var data = [];
  var totalFrames = 0;

  for (var k in this._counts) {
    var v = this._counts[k];
    data.push([k, v]);
    totalFrames += v;
  }

  console.log("Total frames: " + totalFrames);

  window._chartData = data;

  updateChart();
}

MixerTest.prototype.step = function(timeStamp) {
  var delta = timeStamp - this._lastUpdate;
  this._lastUpdate = timeStamp;

  if (this._stepTimes.length >= this._QUEUE_SIZE) {
    this._stepTimeRunningAverage -= this._stepTimes.shift();
  }

  if (this._stepTimes.length < this._QUEUE_SIZE) {
    if (this.elapsedUs != null) {
      this._stepTimes.push(this.elapsedUs);
      this._stepTimeRunningAverage += this.elapsedUs;
    }
  }

  //assert(_stepTimes.length <= _QUEUE_SIZE);

  var avgframe = null;
  if (this._stepTimes.length > 0) {
    avgframe = this._stepTimeRunningAverage / this._stepTimes.length;
    if (avgframe < 5500) {
      this._fastFrameCount++;
      if (this._fastFrameCount > 5) {
        this._fastFrameCount = 0;
        this._addItem();
      }
    } else if (avgframe > 6000) {
      this._fastFrameCount = 0;
      if (this._bouncers.length > 1) {
        this.world.DestroyBody(this._bouncers.shift());
      }
    } else {
      this._fastFrameCount = 0;
    }
  }

  // XXX is this how you call super.step in JS?
  Demo.prototype.step.call(this, timeStamp);

  this.ctx.fillStyle = 'black';
  this.ctx.font = '30px Arial';
  this.ctx.textAlign = 'right';
  this.ctx.fillText(this._bouncers.length + ' items', 150, 30);

  // don't start recording delta's until we have a full queue
  if(delta != null && this._stepTimes.length == this._QUEUE_SIZE) {

    // Track jank

    var current = this._counts[delta];
    if(current == null) current = 0;
    this._counts[delta] = current + 1;

    //ctx.font = '10px Arial';
    //ctx.textAlign = 'left';
    //ctx.fillText(_counts.toString(), 0, 500);
  }
}

function main() {
  var psd = new b2CircleShape(1.0);

  var ballFixtureDef = new b2FixtureDef();
  ballFixtureDef.shape = psd;
  ballFixtureDef.density = 10.0;
  ballFixtureDef.friction = 0.9;
  ballFixtureDef.restitution = 0.95;

  var mixer = new MixerTest(ballFixtureDef);
  mixer.initialize();
  mixer.initializeAnimation();
  mixer.runAnimation();

  var button = document.querySelector('#chart_button');
  button.addEventListener('click', function(e) { mixer._doStats() });
}

main();