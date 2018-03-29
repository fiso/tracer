export function Texture (src) {
  const img = new Image();
  img.src = src;
  this.loading = new Promise((resolve, reject) => {
    img.addEventListener('load', () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      resolve({
        w: canvas.width,
        h: canvas.height,
        data: new Uint32Array(
          ctx.getImageData(0, 0, canvas.width, canvas.height).data.buffer),
      });
    });
  });
}
