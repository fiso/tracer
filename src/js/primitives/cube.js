const {TraceResult} = require('../raytracer');
const {Vector} = require('../math/vector');

function Cube (center, radius, material) {
  this.__typeOf = this.constructor.name;
  this.center = center;
  this.radius = radius;
  this.material = material;
}

Cube.prototype.thaw = function (prototypeLookup) {
  Object.setPrototypeOf(this.center, prototypeLookup.Vector);
  Object.setPrototypeOf(this.material, prototypeLookup.Material);
  this.material.thaw(prototypeLookup);
};

Cube.prototype.getNormal = function (p) {
  const min = this.center.subtract(this.radius);
  const max = this.center.add(this.radius);
  return new Vector(
      (p.x >= max.x) - (p.x <= min.x),
      (p.y >= max.y) - (p.y <= min.y),
      (p.z >= max.z) - (p.z <= min.z),
  );
};

Cube.prototype.intersect = function (ray, distance) {
  const min = this.center.subtract(this.radius);
  const max = this.center.add(this.radius);
  const tMin = min.subtract(ray.origin).divide(ray.direction);
  const tMax = max.subtract(ray.origin).divide(ray.direction);
  const t1 = Vector.min(tMin, tMax);
  const t2 = Vector.max(tMin, tMax);
  const tNear = t1.max();
  const tFar = t2.min();

  if (tNear > 0 && tNear < tFar) {
    if (tNear < distance) {
      const pi = ray.origin.add(ray.direction.multiply(tNear));
      return {result: TraceResult.TR_HIT, distance: tNear,
        normal: this.getNormal(pi)};
    }
  }

  return {result: TraceResult.TR_MISS};
};

module.exports = {
  Cube,
};
