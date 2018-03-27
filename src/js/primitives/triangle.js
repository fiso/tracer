import {TraceResult} from '../raytracer';

export function Triangle (a, b, c, material) {
  this.type = 'sphere';
  this.a = a;
  this.b = b;
  this.c = c;
  this.material = material;
  const ab = this.b.subtract(this.a);
  const ac = this.c.subtract(this.a);
  this.normal = ab.cross(ac).unit();
}

Triangle.prototype.getNormal = function (p) {
  return this.normal;
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
        return {result: TraceResult.TR_HIT, distance: t};
      }
    }
  }

  return {result: TraceResult.TR_MISS};
};
