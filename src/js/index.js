const {Camera} = require('./camera');
const {Color} = require('./color');
const {Material} = require('./material');
const fs = require('fs');
const os = require('os');
const {Plane} = require('./primitives/plane');
const {PointLight} = require('./lights');
const {rand} = require('./random');
const {Scene} = require('./scene');
const {Sphere} = require('./primitives/sphere');
const {Vector} = require('./vector');
const {Worker} = require('worker_threads');
const {performance} = require('perf_hooks');

function constructScene () {
  const scene = new Scene();
  scene.lights.push(new PointLight(new Vector(400, 0, -1000)));
  scene.lights.push(new PointLight(new Vector(-400, 0, -1000)));
  for (let x = -400; x <= 400; x += 400) {
    for (let y = -400; y <= 400; y += 800) {
      for (let z = -800; z <= 800; z += 400) {
        scene.renderables.push(
          new Sphere(new Vector(x, y, z), 100,
            new Material({
              color: new Color(rand(), rand(), rand(), 1),
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

  return scene;
}

const outputWidth = 1280;
const outputHeight = 720;
const bytesPerPixel = 4;
const superSampling = 2;
const w = outputWidth * superSampling;
const h = outputHeight * superSampling;

function render (scene, camera) {
  return new Promise((resolve) => {
    const nThreads = os.cpus().length;
    console.log(`Using ${nThreads} threads`);
    const pixels = new Uint8ClampedArray(w * h * bytesPerPixel);

    let nCompleted = 0;
    const start = performance.now();
    const progress = {};
    for (let i = 0; i < nThreads; i++) {
      const worker = new Worker(`${__dirname}/render.worker.js`, {
        workerData: {
          id: i,
          scene,
          camera,
          region: {
            left: 0,
            top: Math.floor(i * (h / nThreads)),
            width: w,
            height: Math.ceil(h / nThreads),
          },
          full: {
            w, h,
          },
        },
      });

      worker.on('message', function (event) {
        if (event.progress) {
          const totalPixels = w * h;
          progress[event.id] = event.progress.done;
          if (Object.keys(progress).length === nThreads) {
            const done = Object.values(progress)
              .reduce((acc, val) => acc + val);
            reportStatus(`${Math.round(done / totalPixels * 100)}%`);
          }
        } else if (event.frame) {
          const end = performance.now();
          const y = Math.floor(h / superSampling / nThreads * i);
          const framePixels = new Uint8ClampedArray(event.frame);
          pixels.set(framePixels, bytesPerPixel * w * y * superSampling);
          nCompleted++;
          if (nCompleted === nThreads) {
            console.log(`Frame completed in ${Math.round(end - start)} ms`);
            resolve(pixels);
          }
        }
      });
    }
  });
}

function reportStatus (status) {
  process.stdout.write(`\r${status}\r`);
}

function writeTga (pixels, filename, w, h) {
  const buffer = Buffer.alloc(18 + pixels.length * 4);
  buffer.writeInt8(0, 0);
  buffer.writeInt8(0, 1);
  buffer.writeInt8(2, 2);
  buffer.writeInt16LE(0, 3);
  buffer.writeInt16LE(0, 5);
  buffer.writeInt8(0, 7);
  buffer.writeInt16LE(0, 8);
  buffer.writeInt16LE(0, 10);
  buffer.writeInt16LE(w, 12);
  buffer.writeInt16LE(h, 14);
  buffer.writeInt8(32, 16);
  buffer.writeInt8(0, 17);

  let offset = 18;
  for (let i = 0; i < h; i++) {
      for (let j = 0; j < w; j++) {
          const idx = ((h - i - 1) * w + j) * 4;
          // BGRA order
          buffer.writeUInt8(pixels[idx + 2], offset++);
          buffer.writeUInt8(pixels[idx + 1], offset++);
          buffer.writeUInt8(pixels[idx], offset++);
          buffer.writeUInt8(pixels[idx + 3], offset++);
      }
  }
  fs.writeFileSync(filename, buffer);
}

async function execute () {
  console.log('Starting render…');
  try {
    const scene = constructScene();
    const camera = new Camera();
    for (let frame = 0; frame < 24; frame++) {
      const pixels = await render(scene, camera);
      writeTga(pixels, `frame_${frame}.tga`, w, h);
    }
  } catch (e) {
    console.log(e);
  }
  console.log('Render complete');
}

execute();
