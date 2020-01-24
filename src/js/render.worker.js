const {Vector} = require('./vector');
const {Scene} = require('./scene');
const {Color} = require('./color');
const {TraceResult} = require('./raytracer');
const {parentPort, workerData} = require('worker_threads');
const EPSILON = .0001;

console.log('Worker started');

const scene = Scene.deserialize(workerData.scene);
scene.clearColor = new Color(0, 0, 0, 1);
const camera = workerData.camera;
// console.log('Camera matrix: ', camera.matrix);
render(scene, workerData.region, workerData.full, workerData.id, camera);

function traceDepth (scene, camera, ray) {
  let closest = Number.MAX_SAFE_INTEGER;
  for (const object of scene.renderables) {
    const intersection = object.intersect(ray, closest, camera);
    if (intersection.result === TraceResult.TR_HIT) {
      closest = intersection.distance;
    }
  }

  return closest;
}

function raytrace (scene, camera, params) {
  if (params.depth > params.maxTraceDepth) {
    return params;
  }

  let hit = null;
  let hitNormal = null;
  let uv = null;
  for (const object of scene.renderables) {
    const intersection = object.intersect(params.ray, params.distance, camera);
    if (intersection.result === TraceResult.TR_HIT) {
      params.distance = intersection.distance;
      hit = object;
      hitNormal = intersection.normal;
      uv = {u: intersection.u, v: intersection.v};
    }
  }

  if (!hit) {
    return params;
  }

  const pi = params.ray.origin.add(
    params.ray.direction.multiply(params.distance));
  let pointLit = false;
  for (const light of scene.lights) {
    const d = traceDepth(scene, camera, {
      origin: light.center,
      direction: pi.subtract(light.center).unit(),
    });
    if (Math.abs(d - pi.subtract(light.center).length()) > EPSILON) {
      continue;
    }
    pointLit = true;
    const lightVec = light.center.subtract(pi).unit();
    if (hit.material.diffuse > 0) {
      const dot = hitNormal.dot(lightVec);
      if (dot > 0) {
        const diff = dot * hit.material.diffuse;
        if (hit.material.colorMap) {
          params.color = params.color.add(
            hit.material.getColormapPixel(uv.u, uv.v)
            .multiply(light.color).multiply(diff)
          );
        } else {
          params.color = params.color.add(
            hit.material.color.multiply(light.color).multiply(diff)
          );
        }
      }
    }
  }

  if (hit.material.reflectivity > 0 && pointLit) {
    if (params.depth < params.maxTraceDepth) {
      const rayDotN2 = params.ray.direction.dot(hitNormal) * 2;
      const r = params.ray.direction.subtract(hitNormal.multiply(rayDotN2));

      const noiseLevel = .1;
      const noise = () => Math.random() * noiseLevel - .5 * noiseLevel;
      const reflectionTrace = raytrace(scene, camera, {
        ray: {
          origin: pi.add(r.multiply(EPSILON)),
          direction: r.add(new Vector(
            noise(),
            noise(),
            noise(),
          )).unit(),
        },
        maxTraceDepth: params.maxTraceDepth,
        color: scene.clearColor,
        depth: params.depth + 1,
        distance: Number.MAX_SAFE_INTEGER,
      });

      params.depth = reflectionTrace.depth;
      params.color = params.color.add(
        hit.material.color.multiply(reflectionTrace.color)
        .multiply(hit.material.reflectivity));
    }
  }

  return params;
}

function render (scene, region, full, id, camera) {
  const buffer = new ArrayBuffer(region.width * region.height * 4);
  const data = new Uint32Array(buffer);

  const aperture = 1200;
  const origin = new Vector(0, 0, -aperture);

  const totalPixels = region.width * region.height;
  let pixelsDone = 0;
  for (let y = region.top; y < region.top + region.height; ++y) {
    for (let x = region.left; x < region.left + region.width; ++x) {
      const direction = new Vector(
        x - full.w / 2,
        y - full.h / 2, 0)
        .subtract(origin)
        .unit();

      const result = raytrace(scene, camera, {
        ray: {
          origin, direction,
        },
        maxTraceDepth: 5,
        color: scene.clearColor,
        depth: 1,
        distance: Number.MAX_SAFE_INTEGER,
      });

      data[(y - region.top) * region.width + (x - region.left)] =
        result.color.hex();
      pixelsDone++;

      if (!(pixelsDone % 100)) {
        parentPort.postMessage({
          progress: {total: totalPixels, done: pixelsDone}, id});
      }
    }
  }
  parentPort.postMessage({frame: buffer, region}, [buffer]);
}
