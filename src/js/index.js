import './lazyload';
import {documentReady} from './akademi';
import {Vector} from './vector';
import {Color} from './color';
import {PointLight} from './lights';
import {Sphere} from './primitives/sphere';
import {Triangle} from './primitives/triangle';
import {TraceResult} from './raytracer';
import '../scss/main.scss';

const scene = [
  new PointLight(new Vector(0, 0, -400)),
];

let statusElement = null;
documentReady(() => {
  const canvas = document.createElement('canvas');
  canvas.width = window.innerWidth * .9;
  canvas.height = canvas.width / 16 * 9;
  document.body.appendChild(canvas);
  statusElement = document.createElement('div');
  document.body.appendChild(statusElement);

  for (let x = -400; x <= 400; x += 400) {
    for (let y = -400; y <= 400; y += 400) {
      for (let z = 0; z <= 800; z += 400) {
        scene.push(
          new Sphere(new Vector(x, y, z),
            100,
            {color: new Color(Math.random(), Math.random(), Math.random(), 1),
              reflection: .8, diffuse: .9}),
        );
      }
    }
  }

  window.render = render;
  window.scene = scene;
  setStatus('Rendering scene...');
  setTimeout(() => {
    render(0);
  }, 100);
});

const bgColor = new Color(0, 0, 0, 1);

function raytrace (scene, params) {
  // Pixel format ABGR
  if (params.depth > params.maxTraceDepth) {
    return params;
  }

  let hit = null;
  for (const object of scene) {
    if (object.isLight) {
      continue;
    }

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
  for (const light of scene) {
    if (!light.isLight) {
      continue;
    }

    // calculate diffuse shading
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

  const EPSILON = .0001;

  if (hit.material.reflection > 0) {
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

function setStatus (text) {
  statusElement.innerHTML = text;
}

function render (rotation) {
  const thisScene = scene.slice();
  const r = 800;
  const R = [rotation, rotation + Math.PI * 2 / 3 * 2,
    rotation + Math.PI * 2 / 3];
  thisScene.push(new Triangle(
    new Vector(Math.cos(R[0]) * r, Math.sin(R[0]) * r, 1000),
    new Vector(Math.cos(R[1]) * r, Math.sin(R[1]) * r, 1000),
    new Vector(Math.cos(R[2]) * r, Math.sin(R[2]) * r, 1000),
    {color: new Color(1, 0, 1, 1),
      reflection: .8, diffuse: .9}
    ));

  const start = performance.now();
  const canvas = document.querySelector('canvas');
  const context = canvas.getContext('2d');
  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  const buffer = new ArrayBuffer(imageData.data.length);
  const buffer8 = new Uint8ClampedArray(buffer);
  const data = new Uint32Array(buffer);

  const aperture = 800;
  const origin = new Vector(0, 0, -aperture);

  const w = canvas.width;
  const h = canvas.height;

  for (let y = 0; y < h; ++y) {
    for (let x = 0; x < w; ++x) {
      const direction = new Vector(x - w / 2, y - h / 2, 0)
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

      data[y * canvas.width + x] = result.color.hex();
    }
  }

  imageData.data.set(buffer8);
  context.putImageData(imageData, 0, 0);
  const end = performance.now();
  setStatus(`Tracing ${w * h} rays took ${Math.round(end - start)}ms`);
}
