const {Color} = require('./color');

function Material ({color, diffuse, specular, reflectivity, colorMap}) {
  this.__typeOf = this.constructor.name;
  this.color = color || new Color(1, 1, 1, 1);
  this.diffuse = diffuse || 1;
  this.specular = specular || 1;
  this.reflectivity = reflectivity || 0;
  this.colorMap = colorMap || null;
}

Material.prototype.thaw = function (prototypeLookup) {
  Object.setPrototypeOf(this.color, prototypeLookup.Color);
};

Material.prototype.getColormapPixel = function (u, v) {
  const x = u * this.colorMap.w;
  const y = v * this.colorMap.h;
  const pixel = this.colorMap.data[
    this.colorMap.w * Math.round(y) + Math.round(x)];
  return Color.from(pixel);
};

module.exports = {
  Material,
};
