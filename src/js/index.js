import './lazyload';
import {documentReady} from './akademi';
import '../scss/main.scss';

documentReady(() => {
  console.log('Tracer');
  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = canvas.width / 16 * 9;
  document.body.appendChild(canvas);
  window.render = render;
  render();
});

function tracePixel (x, y) {
  return 0xff00ff00;
}

function render () {
  const canvas = document.querySelector('canvas');
  const context = canvas.getContext('2d');
  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  const buffer = new ArrayBuffer(imageData.data.length);
  const buffer8 = new Uint8ClampedArray(buffer);
  const data = new Uint32Array(buffer);

  // Pixel format ABGR
  for (let y = 0; y < canvas.height; ++y) {
    for (let x = 0; x < canvas.width; ++x) {
      data[y * canvas.width + x] = tracePixel(x, y);
    }
  }

  imageData.data.set(buffer8);
  context.putImageData(imageData, 0, 0);
}
