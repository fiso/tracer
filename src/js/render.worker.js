import {Vector} from './vector';
import {Color} from './color';
import {PointLight} from './lights';
import {Sphere} from './primitives/sphere';
import {Triangle} from './primitives/triangle';
import {TraceResult} from './raytracer';

const EPSILON = .0001;

onmessage = function (e) {
  if (e.data.command === 'render') {
    const scene = {
      lights: [
        new PointLight(new Vector(400, 0, -800)),
        new PointLight(new Vector(-400, 0, -800)),
      ],
      renderables: [],
    };

    for (let x = -400; x <= 400; x += 400) {
      for (let y = -400; y <= 400; y += 400) {
        for (let z = 0; z <= 800; z += 400) {
          scene.renderables.push(
            new Sphere(new Vector(x, y, z),
              100,
              {color: new Color(.7, .7, .7, 1),
                reflection: .8, diffuse: .9}),
          );
        }
      }
    }

    render(scene, e.data.region, e.data.full, e.data.rotation || 0);
  }
};

const bgColor = new Color(0, 0, 0, 1);

function traceDistance (scene, ray) {
  for (const object of scene.renderables) {
    const intersection = object.intersect(ray, Number.MAX_SAFE_INTEGER);
    if (intersection.result === TraceResult.TR_HIT) {
      return intersection.distance;
    }
  }

  return Number.MAX_SAFE_INTEGER;
}

function raytrace (scene, params) {
  // Pixel format ABGR
  if (params.depth > params.maxTraceDepth) {
    return params;
  }

  let hit = null;
  for (const object of scene.renderables) {
    const intersection = object.intersect(params.ray, params.distance);
    if (intersection.result === TraceResult.TR_HIT) {
      params.distance = intersection.distance;
      hit = object;
    }
  }

  if (!hit) {
    return params;
  }

  const pi = params.ray.origin.add(
    params.ray.direction.multiply(params.distance));
  let pointLit = false;
  for (const light of scene.lights) {
    const d = traceDistance(scene, {
      origin: light.center,
      direction: pi.subtract(light.center).unit(),
    });
    if (Math.abs(d - pi.subtract(light.center).length()) > EPSILON) {
      continue;
    }
    pointLit = true;
    const lightVec = light.center.subtract(pi).unit();
    const normal = hit.getNormal(pi);
    if (hit.material.diffuse > 0) {
      const dot = normal.dot(lightVec);
      if (dot > 0) {
        const diff = dot * hit.material.diffuse;
        params.color = params.color.add(
          hit.material.color.multiply(light.color).multiply(diff)
        );
      }
    }
  }

  if (hit.material.reflection > 0 && pointLit) {
    if (params.depth < params.maxTraceDepth) {
      const normal = hit.getNormal(pi);
      const rayDotN2 = params.ray.direction.dot(normal) * 2;
      const r = params.ray.direction.subtract(normal.multiply(rayDotN2));

      const reflectionTrace = raytrace(scene, {
        ray: {
          origin: pi.add(r.multiply(EPSILON)),
          direction: r,
        },
        maxTraceDepth: params.maxTraceDepth,
        color: bgColor,
        depth: params.depth + 1,
        distance: Number.MAX_SAFE_INTEGER,
      });

      params.depth = reflectionTrace.depth;
      params.color = params.color.add(
        hit.material.color.multiply(reflectionTrace.color)
        .multiply(hit.material.reflection));
    }
  }

  return params;
}

function render (scene, region, full, rotation = 0) {
  const thisScene = {
    lights: scene.lights,
    renderables: scene.renderables.slice(),
  };
  const r = 800;
  const R = [rotation, rotation + Math.PI * 2 / 3 * 2,
    rotation + Math.PI * 2 / 3];
  thisScene.renderables.push(new Triangle(
    new Vector(Math.cos(R[0]) * r, Math.sin(R[0]) * r, 1000),
    new Vector(Math.cos(R[1]) * r, Math.sin(R[1]) * r, 1000),
    new Vector(Math.cos(R[2]) * r, Math.sin(R[2]) * r, 1000),
    {color: new Color(.35, 0, .4, 1),
      reflection: .8, diffuse: .5}
    ));

  const buffer = new ArrayBuffer(region.width * region.height * 4);
  const data = new Uint32Array(buffer);

  const aperture = 800;
  const origin = new Vector(0, 0, -aperture);

  for (let y = region.top; y < region.top + region.height; ++y) {
    for (let x = region.left; x < region.left + region.width; ++x) {
      const direction = new Vector(
        x - full.w / 2,
        y - full.h / 2, 0)
        .subtract(origin)
        .unit();

      const result = raytrace(thisScene, {
        ray: {
          origin, direction,
        },
        maxTraceDepth: 5,
        color: bgColor,
        depth: 1,
        distance: Number.MAX_SAFE_INTEGER});

      data[(y - region.top) * region.width + (x - region.left)] =
        result.color.hex();
    }
  }
  postMessage({frame: buffer, region});
}
