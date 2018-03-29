import {TraceResult} from '../raytracer';
import {Vector} from '../vector';

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

function sortBy (array, field) {
  return array.sort((a, b) => {
    if (a[field] < b[field]) {
      return -1;
    }
    if (a[field] > b[field]) {
      return 1;
    }
    return 0;
  });
}

Triangle.prototype.getUV = function (p) {
  const xSort = sortBy([this.a, this.b, this.c], 'x');
  const left = xSort[0];
  const right = xSort[2];
  const ySort = sortBy([this.a, this.b, this.c], 'y');
  const top = ySort[0];
  const bottom = ySort[2];
  const width = right.x - left.x;
  const height = bottom.y - top.y;
  const relativePoint = p.subtract(new Vector(left.x, top.y, 0));
  const du = right.u - left.u;
  const dv = bottom.v - top.v;

  return {
    u: left.u + relativePoint.x / width * du,
    v: top.v + relativePoint.y / height * dv,
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
