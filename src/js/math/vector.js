const assert = require('assert');
const {rand} = require('../random');
// Based on https://evanw.github.io/lightgl.js/docs/vector.html

function Vector (x, y, z, w) {
  this.__typeOf = this.constructor.name;
  this.x = x || 0;
  this.y = y || 0;
  this.z = z || 0;
  this.w = w || 1;
}

Vector.prototype = {
  negative: function () {
    return new Vector(-this.x, -this.y, -this.z);
  },

  add: function (v) {
    if (v instanceof Vector) {
      return new Vector(this.x + v.x, this.y + v.y, this.z + v.z);
    } else {
      return new Vector(this.x + v, this.y + v, this.z + v);
    }
  },

  subtract: function (v) {
    if (v instanceof Vector) {
      return new Vector(this.x - v.x, this.y - v.y, this.z - v.z);
    } else {
      return new Vector(this.x - v, this.y - v, this.z - v);
    }
  },

  multiply: function (v) {
    if (v instanceof Vector) {
      return new Vector(this.x * v.x, this.y * v.y, this.z * v.z);
    } else if (Array.isArray(v)) {
      // Assume this is a 4x4 matrix
      assert(v.length === 16);
      return new Vector(
          /* eslint-disable no-multi-spaces */
          v[0] * this.x +  v[1] * this.y +  v[2] * this.z +  v[3] * this.w,
          v[4] * this.x +  v[5] * this.y +  v[6] * this.z +  v[7] * this.w,
          v[8] * this.x +  v[9] * this.y +  v[10] * this.z + v[11] * this.w,
          v[12] * this.x + v[13] * this.y + v[14] * this.z + v[15] * this.w,
          /* eslint-enable no-multi-spaces */
      );
    } else {
      return new Vector(this.x * v, this.y * v, this.z * v);
    }
  },

  divide: function (v) {
    if (v instanceof Vector) {
      return new Vector(this.x / v.x, this.y / v.y, this.z / v.z);
    } else {
      return new Vector(this.x / v, this.y / v, this.z / v);
    }
  },

  equals: function (v) {
    return this.x === v.x && this.y === v.y && this.z === v.z;
  },

  dot: function (v) {
    return this.x * v.x + this.y * v.y + this.z * v.z;
  },

  cross: function (v) {
    return new Vector(
        this.y * v.z - this.z * v.y,
        this.z * v.x - this.x * v.z,
        this.x * v.y - this.y * v.x,
    );
  },

  length: function () {
    return Math.sqrt(this.dot(this));
  },

  unit: function () {
    return this.divide(this.length());
  },

  min: function () {
    return Math.min(Math.min(this.x, this.y), this.z);
  },

  max: function () {
    return Math.max(Math.max(this.x, this.y), this.z);
  },

  toAngles: function () {
    return {
      theta: Math.atan2(this.z, this.x),
      phi: Math.asin(this.y / this.length()),
    };
  },

  angleTo: function (a) {
    return Math.acos(this.dot(a) / (this.length() * a.length()));
  },

  toArray: function (n) {
    return [this.x, this.y, this.z].slice(0, n || 3);
  },

  clone: function () {
    return new Vector(this.x, this.y, this.z);
  },

  init: function (x, y, z) {
    this.x = x; this.y = y; this.z = z;
    return this;
  },
};

Vector.negative = function (a, b) {
  b.x = -a.x; b.y = -a.y; b.z = -a.z;
  return b;
};

Vector.add = function (a, b, c) {
  if (b instanceof Vector) {
    c.x = a.x + b.x; c.y = a.y + b.y; c.z = a.z + b.z;
  } else {
    c.x = a.x + b; c.y = a.y + b; c.z = a.z + b;
  }
  return c;
};

Vector.subtract = function (a, b, c) {
  if (b instanceof Vector) {
    c.x = a.x - b.x; c.y = a.y - b.y; c.z = a.z - b.z;
  } else {
    c.x = a.x - b; c.y = a.y - b; c.z = a.z - b;
  }
  return c;
};

Vector.multiply = function (a, b, c) {
  if (b instanceof Vector) {
    c.x = a.x * b.x; c.y = a.y * b.y; c.z = a.z * b.z;
  } else {
    c.x = a.x * b; c.y = a.y * b; c.z = a.z * b;
  }
  return c;
};

Vector.divide = function (a, b, c) {
  if (b instanceof Vector) {
    c.x = a.x / b.x; c.y = a.y / b.y; c.z = a.z / b.z;
  } else {
    c.x = a.x / b; c.y = a.y / b; c.z = a.z / b;
  }
  return c;
};

Vector.cross = function (a, b, c) {
  c.x = a.y * b.z - a.z * b.y;
  c.y = a.z * b.x - a.x * b.z;
  c.z = a.x * b.y - a.y * b.x;
  return c;
};

Vector.unit = function (a, b) {
  const length = a.length();
  b.x = a.x / length;
  b.y = a.y / length;
  b.z = a.z / length;
  return b;
};

Vector.fromAngles = function (theta, phi) {
  return new Vector(Math.cos(theta) * Math.cos(phi), Math.sin(phi),
      Math.sin(theta) * Math.cos(phi));
};

Vector.randomDirection = function () {
  return Vector.fromAngles(rand() * Math.PI * 2,
      Math.asin(rand() * 2 - 1));
};

Vector.min = function (a, b) {
  return new Vector(Math.min(a.x, b.x), Math.min(a.y, b.y), Math.min(a.z, b.z));
};

Vector.max = function (a, b) {
  return new Vector(Math.max(a.x, b.x), Math.max(a.y, b.y), Math.max(a.z, b.z));
};

Vector.lerp = function (a, b, fraction) {
  return b.subtract(a).multiply(fraction).add(a);
};

Vector.fromArray = function (a) {
  return new Vector(a[0], a[1], a[2]);
};

Vector.angleBetween = function (a, b) {
  return a.angleTo(b);
};

module.exports = {
  Vector,
};
