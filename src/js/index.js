import RenderWorker from './render.worker.js';
import {Color} from './color';
import {Texture} from './texture';
import {Sphere} from './primitives/sphere';
import {Plane} from './primitives/plane';
import {Vertex} from './vertex';
import {Triangle} from './primitives/triangle';
import {Material} from './material';
import {Scene} from './scene';
import {Vector} from './vector';
import {PointLight} from './lights';
import {documentReady} from './domutils';
import 'babel-polyfill';
import '../scss/main.scss';

let statusElement = null;

documentReady(async () => {
  const container = document.querySelector('.render-container');
  const canvas = document.createElement('canvas');
  canvas.width = window.innerWidth - 100;
  canvas.height = canvas.width / 16 * 9;
  container.appendChild(canvas);
  const glCanvas = document.createElement('canvas');
  glCanvas.width = canvas.width;
  glCanvas.height = canvas.height;
  glCanvas.classList.add('gl');
  window.gl = glCanvas.getContext('webgl');
  container.appendChild(glCanvas);
  statusElement = document.createElement('div');
  document.body.appendChild(statusElement);

  render(await constructScene(Math.PI / 2));
});

window.constructScene = constructScene;
window.render = render;

async function constructScene (rotation = 0) {
  const scene = new Scene();
  scene.textures = await preloadTextures(['/img/horsey.jpg']);
  scene.lights.push(new PointLight(new Vector(400, 0, -1000)));
  scene.lights.push(new PointLight(new Vector(-400, 0, -1000)));
  for (let x = -400; x <= 400; x += 400) {
    for (let y = -400; y <= 400; y += 800) {
      for (let z = -800; z <= 800; z += 400) {
        scene.renderables.push(
          new Sphere(new Vector(x, y, z), 100,
            new Material({
              color: new Color(Math.random(), Math.random(), Math.random(), 1),
              reflectivity: .8,
              diffuse: .6,
            })
          )
        );
      }
    }
  }

  scene.renderables.push(new Plane(
    new Vector(0, -1, 0),
    800,
    new Material({
      color: new Color(1, 1, 1, 1),
      reflectivity: 0,
      diffuse: 1,
    })
  ));

  const r = 800;
  const R = [rotation, rotation + Math.PI * 2 / 3 * 2,
    rotation + Math.PI * 2 / 3];
  scene.renderables.push(new Triangle(
    new Vertex(Math.cos(R[0]) * r, Math.sin(R[0]) * r, 100, {u: .5, v: 1}),
    new Vertex(Math.cos(R[1]) * r, Math.sin(R[1]) * r, 100, {u: 1, v: 0}),
    new Vertex(Math.cos(R[2]) * r, Math.sin(R[2]) * r, 100, {u: 0, v: 0}),
    new Material({
      color: new Color(.7, 0, .6, 1),
      reflectivity: .8,
      diffuse: .5,
      colorMap: scene.textures[0],
    })
  ));
  return scene;
}

function preloadTextures (sources) {
  return new Promise(async (resolve, reject) => {
    resolve(await Promise.all(sources.map((src) => {
      const t = new Texture(src);
      return t.loading;
    })));
  });
}

function setStatus (text) {
  statusElement.innerHTML = text;
}

function imagedataToImage (imagedata) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = imagedata.width;
  canvas.height = imagedata.height;
  ctx.putImageData(imagedata, 0, 0);
  const image = new Image();
  image.src = canvas.toDataURL();
  return image;
}

function render (scene) {
  return new Promise((resolve, reject) => {
    const nThreads = navigator.hardwareConcurrency;
    const canvas = document.querySelector('canvas');
    const context = canvas.getContext('2d');
    const superSampling = 2;
    const w = canvas.width * superSampling;
    const h = canvas.height * superSampling;

    let nCompleted = 0;
    const start = performance.now();
    const progress = {};
    for (let i = 0; i < nThreads; i++) {
      const worker = new RenderWorker();
      worker.addEventListener('message', function (event) {
        if (event.data.progress) {
          const totalPixels = w * h;
          progress[event.data.id] = event.data.progress.done;
          if (Object.keys(progress).length === nThreads) {
            const done = Object.values(progress)
              .reduce((acc, val) => acc + val);
            setStatus(`${Math.round(done / totalPixels * 100)}%`);
          }
        } else if (event.data.frame) {
          const end = performance.now();
          const frame = new ImageData(new Uint8ClampedArray(event.data.frame),
            event.data.region.width, event.data.region.height);
          const img = imagedataToImage(frame);
          img.addEventListener('load', () => {
            context.drawImage(img, 0,
              Math.floor(h / superSampling / nThreads * i), canvas.width,
              event.data.region.height / superSampling);
          });
          nCompleted++;
          if (nCompleted === nThreads) {
            canvas.style.opacity = 1;
            setStatus(`${Math.round(end - start)} ms`);
            resolve();
          }
        }
      });

      worker.postMessage({
        command: 'render',
        id: i,
        scene,
        region: {
          left: 0,
          top: Math.floor(i * (h / nThreads)),
          width: w,
          height: Math.ceil(h / nThreads),
        },
        full: {
          w, h,
        },
      }); // }, scene.textures.map((t) => t.data.buffer));
    }
  });
}
