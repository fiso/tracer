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
  canvas.width = window.innerWidth * .7;
  canvas.height = canvas.width / 16 * 9;
  document.body.appendChild(canvas);
  statusElement = document.createElement('div');
  document.body.appendChild(statusElement);

  const scene = await constructScene();
  render(scene);
});

async function constructScene () {
  const scene = new Scene();
  scene.textures = await preloadTextures(['/img/horsey.jpg']);
  scene.lights.push(new PointLight(new Vector(400, 0, -800)));
  scene.lights.push(new PointLight(new Vector(-400, 0, -800)));
  for (let x = -400; x <= 400; x += 400) {
    for (let y = -400; y <= 400; y += 800) {
      for (let z = 0; z <= 800; z += 400) {
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
  const rot = .8;
  const R = [rot, rot + Math.PI * 2 / 3 * 2, rot + Math.PI * 2 / 3];
  scene.renderables.push(new Triangle(
    new Vertex(Math.cos(R[0]) * r, Math.sin(R[0]) * r, 1000, {u: 1, v: 1}),
    new Vertex(Math.cos(R[1]) * r, Math.sin(R[1]) * r, 1000, {u: 0, v: 1}),
    new Vertex(Math.cos(R[2]) * r, Math.sin(R[2]) * r, 1000, {u: 0, v: 0}),
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

function render (scene) {
  const nThreads = navigator.hardwareConcurrency;
  const canvas = document.querySelector('canvas');
  const context = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;

  let nCompleted = 0;
  const start = performance.now();
  for (let i = 0; i < nThreads; i++) {
    const worker = new RenderWorker();
    worker.addEventListener('message', function (event) {
      const end = performance.now();
      const frame = new ImageData(new Uint8ClampedArray(event.data.frame),
        event.data.region.width, event.data.region.height);
      context.putImageData(frame, event.data.region.left,
        event.data.region.top);
      nCompleted++;
      if (nCompleted === nThreads) {
        setStatus(`Tracing ${w * h} rays took ${Math.round(end - start)}ms`);
      }
      frames.push(frame);
    });

    worker.postMessage({
      command: 'render',
      scene,
      textures: scene.textures,
      region: {
        left: 0,
        top: Math.floor(i * (h / nThreads)),
        width: w,
        height: Math.ceil(h / nThreads),
      },
      full: {
        w, h,
      },
    });
    // }, [textures]); TODO: Transfer ownership of huge buffers
  }

  console.log('All queued up');
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
window.render = render;

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
