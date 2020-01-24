const assert = require('assert');
const {Sphere} = require('./primitives/sphere');
const {Triangle} = require('./primitives/triangle');
const {Plane} = require('./primitives/plane');
const {Cube} = require('./primitives/cube');
const {Color} = require('./color');
const {Vector} = require('./vector');
const {Vertex} = require('./vertex');
const {Material} = require('./material');
const {PointLight} = require('./lights');
const {Texture} = require('./texture');

function Scene () {
  this.__typeOf = this.constructor.name;
  this.lights = [];
  this.renderables = [];
  this.textures = [];
}

const prototypeLookup = {
  Object: Object.prototype,
  PointLight: PointLight.prototype,
  Sphere: Sphere.prototype,
  Cube: Cube.prototype,
  Triangle: Triangle.prototype,
  Plane: Plane.prototype,
  Color: Color.prototype,
  Vector: Vector.prototype,
  Vertex: Vertex.prototype,
  Texture: Texture.prototype,
  Material: Material.prototype,
};

Scene.deserialize = function (s) {
  Object.setPrototypeOf(s, Scene.prototype);

  for (const light of s.lights) {
    assert(prototypeLookup[light.__typeOf]);
    Object.setPrototypeOf(light, prototypeLookup[light.__typeOf]);
    light.thaw(prototypeLookup);
  }

  for (const renderable of s.renderables) {
    assert(prototypeLookup[renderable.__typeOf]);
    Object.setPrototypeOf(renderable, prototypeLookup[renderable.__typeOf]);
    renderable.thaw(prototypeLookup);
  }

  return s;
};

module.exports = {
  Scene,
};
