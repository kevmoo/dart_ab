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

library MixerDemo;

import 'dart:collection';
import 'dart:math' as math;
import 'package:box2d/box2d_browser.dart';
import 'demo.dart';

class MixerTest extends Demo {

  final FixtureDef _ballFixture;
  final math.Random _rnd;

  MixerTest(this._ballFixture)
      : _rnd = new math.Random(),
        super("Mixer test", new Vector2(0.0, -30.0), 5.0);


  @override
  void initialize() {

    var sd = new PolygonShape();
    sd.setAsBox(50.0, 0.4);

    var bd = new BodyDef();
    bd.position.setValues(0.0, 0.0);
    assert (world != null);

    //
    // Rotating thing
    //

    var numPieces = 6;
    var radius = 50;
    bd = new BodyDef()
        ..type = BodyType.DYNAMIC;
    var body = world.createBody(bd);

    for (int i = 0; i < numPieces; i++) {
      var angle = 2 * math.PI * (i / numPieces.toDouble());

      var xPos = radius * math.cos(angle);
      var yPos = radius * math.sin(angle);

      var cd = new PolygonShape();
      cd.setAsBoxWithCenterAndAngle(1.0, 30.0, new Vector2(xPos, yPos), angle);

      var fd = new FixtureDef()
          ..shape = cd
          ..density = 10.0
          ..friction = 0.0
          ..restitution = 0.0;

      body.createFixture(fd);
    }

    body.bullet = false;

    // Create an empty ground body.
    var bodyDef = new BodyDef();
    var groundBody = world.createBody(bodyDef);

    var rjd = new RevoluteJointDef()
        ..initialize(body, groundBody, body.position)
        ..motorSpeed = 0.8
        ..maxMotorTorque = 100000000.0
        ..enableMotor = true;

    world.createJoint(rjd);
  }

  // TODO(kevmoo) all of these fields should move to the top
  static const _QUEUE_SIZE = 100;
  final List<Body> _bouncers = new List<Body>();
  final Queue<num> _frameQueue = new Queue<num>();
  final SplayTreeMap<int, int> _counts = new SplayTreeMap<int, int>();

  int _stepCounter = 0;
  int _fastFrameCount = 0;
  num _lastUpdate = 0;
  num _runningAverage = 0;

  @override
  void step(num timeStamp) {

    var delta = timeStamp - _lastUpdate;
    _lastUpdate = timeStamp;

    if(_frameQueue.length >= _QUEUE_SIZE) {
      _runningAverage -= _frameQueue.removeFirst();
    }

    if(_frameQueue.length < _QUEUE_SIZE) {
      if (elapsedUs != null) {
        _frameQueue.add(elapsedUs);
        _runningAverage += elapsedUs;
      }
    }

    assert(_frameQueue.length <= _QUEUE_SIZE);

    var avgframe = null;
    if (_frameQueue.length > 0) {
      avgframe = _runningAverage / _frameQueue.length;
      if (avgframe < 5500) {
        _fastFrameCount++;
        if (_fastFrameCount > 5) {
          _fastFrameCount = 0;
          _addFallingThing();
        }
      } else if (avgframe > 7000) {
        _fastFrameCount = 0;
        if (_bouncers.length > 1) {
          world.destroyBody(_bouncers.removeAt(0));
        }
      } else {
        _fastFrameCount = 0;
      }
    }

    super.step(timeStamp);

    ctx.fillStyle = 'black';
    ctx.font = '30px Arial';
    ctx.textAlign = 'right';
    ctx.fillText('${_bouncers.length} items', 150, 30);

    if(avgframe != null) {
      
      // Track jank
      
      var deltaInt = (avgframe / 100).toInt();
      var current = _counts[deltaInt];
      if(current == null) current = 0;
      _counts[deltaInt] = current + 1;

      ctx.font = '10px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(_counts.toString(), 0, 500);
    }
  }

  void _addFallingThing() {
    var bd2 = new BodyDef()
        ..type = BodyType.DYNAMIC
        ..position = new Vector2(0.0, 40.0);

    bd2.linearVelocity = new Vector2(35.0, 0.0);

    var ball = world.createBody(bd2)
        ..createFixture(_ballFixture);

    _bouncers.add(ball);
  }
}

void main() {

  var psd = new CircleShape()
      ..radius = 1.0;

  var ballFixtureDef = new FixtureDef()
      ..shape = psd
      ..density = 10.0
      ..friction = 0.9
      ..restitution = 0.95;

  new MixerTest(ballFixtureDef)
      ..initialize()
      ..initializeAnimation()
      ..runAnimation();
}
