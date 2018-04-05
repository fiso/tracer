import {Sphere} from './primitives/sphere';
import {Triangle} from './primitives/triangle';
import {Plane} from './primitives/plane';
import {Cube} from './primitives/cube';
import {Color} from './color';
import {Vector} from './vector';
import {Vertex} from './vertex';
import {Material} from './material';
import {PointLight} from './lights';

export function Scene () {
  this.__typeOf = this.constructor.name;
  this.lights = [];
  this.renderables = [];
  this.textures = [];
}

const prototypeLookup = {
  'Object': Object.prototype,
  'PointLight': PointLight.prototype,
  'Sphere': Sphere.prototype,
  'Cube': Cube.prototype,
  'Triangle': Triangle.prototype,
  'Plane': Plane.prototype,
  'Color': Color.prototype,
  'Vector': Vector.prototype,
  'Vertex': Vertex.prototype,
  'Material': Material.prototype,
};

Scene.deserialize = function (s) {
  Object.setPrototypeOf(s, Scene.prototype);

  for (const light of s.lights) {
    Object.setPrototypeOf(light, prototypeLookup[light.__typeOf]);
    light.thaw(prototypeLookup);
  }

  for (const renderable of s.renderables) {
    Object.setPrototypeOf(renderable, prototypeLookup[renderable.__typeOf]);
    renderable.thaw(prototypeLookup);
  }

  return s;
};
