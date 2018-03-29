import {Vector} from './vector';

export function Vertex (x, y, z, params) {
  Vector.call(this, x, y, z);
  this.__typeOf = 'Vertex';

  this.u = params ? params.u : undefined;
  this.v = params ? params.v : undefined;
}

Vertex.prototype = Vector.prototype;