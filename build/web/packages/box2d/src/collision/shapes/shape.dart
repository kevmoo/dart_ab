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
 * A shape is used for collision detection. You can create a shape however you
 * like. Shapes used for simulation in World are created automatically when
 * a Fixture is created.  Shapes may encapsulate a one or more child shapes.
 */

part of box2d;

abstract class Shape {
  /** The type of shape. Either circle or polygon. */
  int type;

  /** Shape radius. */
  double radius;

  /**
   * Constructs a new shape of unknown type.
   */
  Shape([int type = ShapeType.UNKNOWN, double radius = 0.0]) :
    type = type,
    radius = radius { }

  /**
   * Test a point for containment in this shape. This only works for convex
   * shapes.
   * transform:  the shape world transform.
   * point: a point in world coordinates.
   */
  bool testPoint(Transform transform, Vector2 point);

  /**
   * Computes the associated axis aligned bounding box for a child shape
   * given a transform. Returns through the given out paramater.
   */
  void computeAxisAlignedBox(AxisAlignedBox box, Transform transform);

  /**
   * Computes (and returns through the given out parameter massData) the mass
   * properties of this shape using its dimensions and the
   * given density. The inertia tensor is computed about the local origin.
   */
  void computeMass(MassData massData, num density);

  /** Returns a clone of this shape. */
  Shape clone();
}
