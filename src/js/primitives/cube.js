Raytracer.hitTestBox = function(origin, ray, min, max) {
  var tMin = min.subtract(origin).divide(ray);
  var tMax = max.subtract(origin).divide(ray);
  var t1 = Vector.min(tMin, tMax);
  var t2 = Vector.max(tMin, tMax);
  var tNear = t1.max();
  var tFar = t2.min();

  if (tNear > 0 && tNear < tFar) {
    var epsilon = 1.0e-6, hit = origin.add(ray.multiply(tNear));
    min = min.add(epsilon);
    max = max.subtract(epsilon);
    return new HitTest(tNear, hit, new Vector(
      (hit.x > max.x) - (hit.x < min.x),
      (hit.y > max.y) - (hit.y < min.y),
      (hit.z > max.z) - (hit.z < min.z)
    ));
  }

  return null;
};
