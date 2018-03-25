function cap (n) {
  return Math.min(Math.max(n, 0), 1);
}

export function Color (r, g, b, a) {
  this.r = cap(r);
  this.g = cap(g);
  this.b = cap(b);
  this.a = cap(a);
}

Color.prototype.hex = function () {
  return 255 * this.a << 24 |
         255 * this.b << 16 |
         255 * this.g << 8 |
         255 * this.r;
};

Color.prototype.add = function (c) {
  if (c instanceof Color) {
    return new Color(
      cap(this.r + c.r),
      cap(this.g + c.g),
      cap(this.b + c.b),
      cap(this.a + c.a));
  } else {
    return new Color(
      cap(this.r + c),
      cap(this.g + c),
      cap(this.b + c),
      cap(this.a + c));
  }
};

Color.prototype.multiply = function (c) {
  if (c instanceof Color) {
    return new Color(
      cap(this.r * c.r),
      cap(this.g * c.g),
      cap(this.b * c.b),
      cap(this.a * c.a));
  } else {
    return new Color(
      cap(this.r * c),
      cap(this.g * c),
      cap(this.b * c),
      cap(this.a * c));
  }
};
