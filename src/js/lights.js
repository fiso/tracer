import {Color} from './color';

export function PointLight (p) {
  this.isLight = true;
  this.center = p;
  this.color = new Color(1, 1, 1, 1);
}
