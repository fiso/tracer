/* global SharedArrayBuffer */

export function Texture (src) {
  this.__typeOf = this.constructor.name;
  const img = new Image();
  img.src = src;
  this.loading = new Promise((resolve, reject) => {
    img.addEventListener('load', () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);

      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      if (window.SharedArrayBuffer) {
        console.warn('Using SharedArrayBuffer — you might get Spectre\'d 👻');
        const shared = new SharedArrayBuffer(imgData.data.length);
        new Uint8Array(shared).set(new Uint8Array(imgData.data.buffer));
        resolve({
          w: canvas.width,
          h: canvas.height,
          data: new Uint32Array(shared),
        });
      } else {
        resolve({
          w: canvas.width,
          h: canvas.height,
          data: new Uint32Array(imgData.data.buffer),
        });
      }
    });
  });
}
