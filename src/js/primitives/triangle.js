import {TraceResult} from '../raytracer';

export function Triangle (a, b, c, material) {
  this.__typeOf = this.constructor.name;
  this.a = a;
  this.b = b;
  this.c = c;
  const ab = this.b.subtract(this.a);
  const ac = this.c.subtract(this.a);
  this.normal = ab.cross(ac).unit();
  this.material = material;
}

Triangle.prototype.thaw = function (prototypeLookup) {
  Object.setPrototypeOf(this.a, prototypeLookup[this.a.__typeOf]);
  Object.setPrototypeOf(this.b, prototypeLookup[this.b.__typeOf]);
  Object.setPrototypeOf(this.c, prototypeLookup[this.c.__typeOf]);
  Object.setPrototypeOf(this.normal, prototypeLookup.Vector);
  Object.setPrototypeOf(this.material, prototypeLookup.Material);
  this.material.thaw(prototypeLookup);
};

Triangle.prototype.getNormal = function (p) {
  return this.normal;
};

Triangle.prototype.getUV = function (f) {
  const f1 = this.a.subtract(f);
  const f2 = this.b.subtract(f);
  const f3 = this.c.subtract(f);

  const a = this.a.subtract(this.b).cross(this.a.subtract(this.c)).length();
  const a1 = f2.cross(f3).length() / a;
  const a2 = f3.cross(f1).length() / a;
  const a3 = f1.cross(f2).length() / a;

  return {
    u: this.a.u * a1 + this.b.u * a2 + this.c.u * a3,
    v: this.a.v * a1 + this.b.v * a2 + this.c.v * a3,
  };
};

Triangle.prototype.intersect = function (ray, distance) {
  const ab = this.b.subtract(this.a);
  const ac = this.c.subtract(this.a);
  const normal = this.normal;
  const t = normal.dot(this.a.subtract(ray.origin)) / normal.dot(ray.direction);

  if (t > 0) {
    const hit = ray.origin.add(ray.direction.multiply(t));
    const toHit = hit.subtract(this.a);
    const dot00 = ac.dot(ac);
    const dot01 = ac.dot(ab);
    const dot02 = ac.dot(toHit);
    const dot11 = ab.dot(ab);
    const dot12 = ab.dot(toHit);
    const divide = dot00 * dot11 - dot01 * dot01;
    const u = (dot11 * dot02 - dot01 * dot12) / divide;
    const v = (dot00 * dot12 - dot01 * dot02) / divide;
    if (u >= 0 && v >= 0 && u + v <= 1) {
      if (t < distance) {
        const pi = ray.origin.add(ray.direction.multiply(t));
        const uv = this.getUV(pi);
        return {result: TraceResult.TR_HIT, distance: t, normal,
          u: uv.u, v: uv.v};
      }
    }
  }

  return {result: TraceResult.TR_MISS};
};
