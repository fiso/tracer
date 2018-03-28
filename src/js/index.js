import RenderWorker from './render.worker.js';
import {documentReady} from './akademi';
import '../scss/main.scss';

let statusElement = null;

documentReady(() => {
  const canvas = document.createElement('canvas');
  canvas.width = window.innerWidth * .7;
  canvas.height = canvas.width / 16 * 9;
  document.body.appendChild(canvas);
  statusElement = document.createElement('div');
  document.body.appendChild(statusElement);

  render();
});

function getContext () {
  return document.querySelector('canvas').getContext('2d');
}

function setStatus (text) {
  statusElement.innerHTML = text;
}

const frames = [];

function render (rotation = 0) {
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
