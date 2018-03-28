import {TraceResult} from '../raytracer';
import {Vector} from '../vector';

export function Cube (center, radius, material) {
  this.type = 'cube';
  this.center = center;
  this.radius = radius;
  this.material = material;
}

Cube.prototype.getNormal = function (p) {
  const min = this.center.subtract(this.radius);
  const max = this.center.add(this.radius);
  return new Vector(
    (p.x >= max.x) - (p.x <= min.x),
    (p.y >= max.y) - (p.y <= min.y),
    (p.z >= max.z) - (p.z <= min.z)
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
      return {result: TraceResult.TR_HIT, distance: tNear};
    }
  }

  return {result: TraceResult.TR_MISS};
};
