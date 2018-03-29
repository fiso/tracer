import RenderWorker from './render.worker.js';
import {Color} from './color';
import {Texture} from './texture';
import {Sphere} from './primitives/sphere';
import {Vertex} from './vertex';
import {Triangle} from './primitives/triangle';
import {Material} from './material';
import {Scene} from './scene';
import {Vector} from './vector';
import {PointLight} from './lights';
import {documentReady} from './akademi';
import 'babel-polyfill';
import '../scss/main.scss';

let statusElement = null;

documentReady(async () => {
  const canvas = document.createElement('canvas');
  canvas.width = window.innerWidth - 100;
  canvas.height = canvas.width / 16 * 9;
  document.body.appendChild(canvas);
  statusElement = document.createElement('div');
  document.body.appendChild(statusElement);

  const scene = await constructScene();
  render(scene);
});

window.constructScene = constructScene;
window.render = render;

async function constructScene (rotation = 0) {
  const scene = new Scene();
  scene.textures = await preloadTextures(['/img/horsey.jpg']);
  scene.lights.push(new PointLight(new Vector(400, 0, -800)));
  scene.lights.push(new PointLight(new Vector(-400, 0, -800)));
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
  const r = 800;
  const R = [rotation, rotation + Math.PI * 2 / 3 * 2,
    rotation + Math.PI * 2 / 3];
  scene.renderables.push(new Triangle(
    new Vertex(Math.cos(R[0]) * r, Math.sin(R[0]) * r, 100, {u: 1, v: 1}),
    new Vertex(Math.cos(R[1]) * r, Math.sin(R[1]) * r, 100, {u: 0, v: 1}),
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

function getContext () {
  return document.querySelector('canvas').getContext('2d');
}

function setStatus (text) {
  statusElement.innerHTML = text;
}

const frames = [];

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
          const done = Object.values(progress).reduce((acc, val) => acc + val);
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
        }
        frames.push(frame);
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
    }); // , scene.textures.map((t) => t.data.buffer)
  }
}

function preRender () {
  const step = Math.PI * 2 / 60;
  for (let r = 0; r < 2 * Math.PI; r += step) {
    render(r);
    console.log(
      `Prerendering frames... ${Math.round(100 * (r / (Math.PI * 2)))}%`);
  }
}

window.preRender = preRender;
window.play = play;
window.frames = frames;

function play () {
  const context = getContext();
  for (let i = 0; i < window.frames.length; i++) {
    const frame = window.frames[i];
    setTimeout(() => {
      context.putImageData(frame, 0, 0);
      if (i >= window.frames.length - 1) {
        play();
      }
    }, i * 20);
  }
}
