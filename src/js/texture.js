/* global SharedArrayBuffer */
const fs = require('fs');
const PNG = require('pngjs').PNG;

function Texture (src) {
  this.__typeOf = this.constructor.name;
  this.loading = new Promise((resolve) => {
    fs.createReadStream(src)
        .pipe(new PNG())
        .on('parsed', function () {
          /* eslint-disable no-invalid-this */
          const shared = new SharedArrayBuffer(this.data.length);
          new Uint8Array(shared).set(new Uint8Array(this.data));
          resolve({
            w: this.width,
            h: this.height,
            data: new Uint32Array(shared),
          });
          /* eslint-enable no-invalid-this */
        });
  });
}

module.exports = {
  Texture,
};
