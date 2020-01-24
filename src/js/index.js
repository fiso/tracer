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
const PNG = require('pngjs').PNG;

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

function writePng (pixels, filename, width, height) {
  const png = new PNG({
      width,
      height,
      filterType: -1,
  });

  png.data = pixels;

  png.pack().pipe(fs.createWriteStream(filename));
}

async function execute () {
  console.log('Starting render…');
  try {
    const scene = constructScene();
    const camera = new Camera();
    for (let frame = 0; frame < 1; frame++) {
      const pixels = await render(scene, camera);
      writePng(pixels, `frame_${frame}.png`, w, h);
    }
  } catch (e) {
    console.log(e);
  }
  console.log('Render complete');
}

execute();
