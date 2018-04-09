import {TraceResult} from '../raytracer';

export function Plane (normal, d, material) {
  this.__typeOf = this.constructor.name;
  this.normal = normal;
  this.d = d;
  this.material = material;
}

Plane.prototype.thaw = function (prototypeLookup) {
  Object.setPrototypeOf(this.normal, prototypeLookup.Vector);
  Object.setPrototypeOf(this.material, prototypeLookup.Material);
  this.material.thaw(prototypeLookup);
};

Plane.prototype.getNormal = function (p) {
  return this.normal;
};

Plane.prototype.intersect = function (ray, distance) {
  const dot = this.normal.dot(ray.direction);

  if (!dot) { // 🙀
    return {result: TraceResult.TR_MISS};
  }

  const dist = -(this.normal.dot(ray.origin) + this.d) / dot;
  if (dist <= 0) {
    return {result: TraceResult.TR_MISS};
  }

  if (dist < distance) {
    return {result: TraceResult.TR_HIT, distance: dist, normal: this.normal};
  }

  return {result: TraceResult.TR_MISS};
};
