import {TraceResult} from '../raytracer';

export function Sphere (center, radius, material) {
  this.__typeOf = this.constructor.name;
  this.center = center;
  this.radius = radius;
  this.material = material;
}

Sphere.prototype.thaw = function (prototypeLookup) {
  Object.setPrototypeOf(this.center, prototypeLookup.Vector);
  Object.setPrototypeOf(this.material, prototypeLookup.Material);
  this.material.thaw(prototypeLookup);
};

Sphere.prototype.getNormal = function (p) {
  return p.subtract(this.center).unit();
};

Sphere.prototype.intersect2 = function (ray, distance) {
  const offset = ray.origin.subtract(this.center);
  const a = ray.direction.dot(ray.direction);
  const b = 2 * ray.direction.dot(offset);
  const c = offset.dot(offset) - this.radius * this.radius;
  const discriminant = b * b - 4 * a * c;

  if (discriminant > 0) {
    const t = (-b - Math.sqrt(discriminant)) / (2 * a);
    if (t < distance) {
      const pi = ray.origin.add(ray.direction.multiply(t));
      return {result: TraceResult.TR_HIT, distance: t,
        normal: this.getNormal(pi)};
    }
  }

  return {result: TraceResult.TR_MISS};
};

Sphere.prototype.intersect = function (ray, distance) {
  const localRayOrigin = ray.origin.subtract(this.center);

  // Compute A, B and C coefficients
  const a = ray.direction.dot(ray.direction);
  const b = 2 * ray.direction.dot(localRayOrigin);
  const c = localRayOrigin.dot(localRayOrigin) - this.radius * this.radius;

  // Find discriminant
  const disc = b * b - 4 * a * c;

  // if discriminant is negative there are no real roots, so return
  // false as ray misses sphere
  if (disc < 0) {
    return {result: TraceResult.TR_MISS};
  }

  // compute q as described above
  const distSqrt = Math.sqrt(disc);
  let q = 0;
  if (b < 0) {
    q = (-b - distSqrt) / 2;
  } else {
    q = (-b + distSqrt) / 2;
  }

  // compute t0 and t1
  let t0 = q / a;
  let t1 = c / q;

  // make sure t0 is smaller than t1
  if (t0 > t1) {
    // if t0 is bigger than t1 swap them around
    const temp = t0;
    t0 = t1;
    t1 = temp;
  }

  // if t1 is less than zero, the object is in the ray's negative direction
  // and consequently the ray misses the sphere
  if (t1 < 0) {
    return {result: TraceResult.TR_MISS};
  }

  // if t0 is less than zero, the intersection point is at t1
  if (t0 < 0) {
    if (t1 < distance) {
      const pi = ray.origin.add(ray.direction.multiply(t1));
      return {result: TraceResult.TR_HIT, distance: t1,
        normal: this.getNormal(pi)};
    } else {
      return {result: TraceResult.TR_MISS};
    }
  } else {
    // else the intersection point is at t0
    if (t0 < distance) {
      const pi = ray.origin.add(ray.direction.multiply(t0));
      return {result: TraceResult.TR_HIT, distance: t0,
        normal: this.getNormal(pi)};
    } else {
      return {result: TraceResult.TR_MISS};
    }
  }
};
