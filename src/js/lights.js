import {Color} from './color';

export function PointLight (p) {
  this.__typeOf = this.constructor.name;
  this.center = p;
  this.color = new Color(1, 1, 1, 1);
}

PointLight.prototype.thaw = function (prototypeLookup) {
  Object.setPrototypeOf(this.center, prototypeLookup.Vector);
  Object.setPrototypeOf(this.color, prototypeLookup.Color);
};
