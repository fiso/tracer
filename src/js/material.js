import {Color} from './color';

export function Material ({color, diffuse, specular, reflectivity, colorMap}) {
  this.color = color || new Color(1, 1, 1, 1);
  this.diffuse = diffuse || 1;
  this.specular = specular || 1;
  this.reflectivity = reflectivity || 0;
  this.colorMap = colorMap || null;
}

Material.prototype.getColormapPixel = function (u, v) {
  const x = u * this.colorMap.w;
  const y = v * this.colorMap.h;
  const pixel = this.colorMap.data[
    this.colorMap.w * Math.round(x) + Math.round(y)];
  return Color.from(pixel);
};
