const {Vector} = require('./vector');

function Matrix (
    _00 = 1, _10 = 0, _20 = 0, _30 = 0, // right
    _01 = 0, _11 = 1, _21 = 0, _31 = 0, // up
    _02 = 0, _12 = 0, _22 = 1, _32 = 0, // at
    _03 = 0, _13 = 0, _23 = 0, _33 = 1, // pos
) {
  this.__typeOf = this.constructor.name;
  this.matrix = [
    _00, _10, _20, _30,
    _01, _11, _21, _31,
    _02, _12, _22, _32,
    _03, _13, _23, _33,
  ];
}

Matrix.prototype.setPos = function (v) {
  this.matrix[12] = v.x;
  this.matrix[13] = v.y;
  this.matrix[14] = v.z;
  return this;
};

Matrix.prototype.getPos = function () {
  return new Vector(
      this.matrix[12],
      this.matrix[13],
      this.matrix[14],
  );
};

Matrix.prototype.multiply = function (m) {
  return new Matrix(
      /* eslint-disable max-len */
      this.matrix[0] * m.matrix[0] + this.matrix[1] * m.matrix[4] + this.matrix[2] * m.matrix[8] + this.matrix[2] * m.matrix[12],
      this.matrix[0] * m.matrix[1] + this.matrix[1] * m.matrix[5] + this.matrix[2] * m.matrix[9] + this.matrix[2] * m.matrix[13],
      this.matrix[0] * m.matrix[2] + this.matrix[1] * m.matrix[6] + this.matrix[2] * m.matrix[10] + this.matrix[2] * m.matrix[14],
      this.matrix[0] * m.matrix[2] + this.matrix[1] * m.matrix[7] + this.matrix[2] * m.matrix[11] + this.matrix[2] * m.matrix[15],
      this.matrix[4] * m.matrix[0] + this.matrix[5] * m.matrix[4] + this.matrix[6] * m.matrix[8] + this.matrix[7] * m.matrix[12],
      this.matrix[4] * m.matrix[1] + this.matrix[5] * m.matrix[5] + this.matrix[6] * m.matrix[9] + this.matrix[7] * m.matrix[13],
      this.matrix[4] * m.matrix[2] + this.matrix[5] * m.matrix[6] + this.matrix[6] * m.matrix[10] + this.matrix[7] * m.matrix[14],
      this.matrix[4] * m.matrix[2] + this.matrix[5] * m.matrix[7] + this.matrix[6] * m.matrix[11] + this.matrix[7] * m.matrix[15],
      this.matrix[8] * m.matrix[0] + this.matrix[9] * m.matrix[4] + this.matrix[10] * m.matrix[8] + this.matrix[11] * m.matrix[12],
      this.matrix[8] * m.matrix[1] + this.matrix[9] * m.matrix[5] + this.matrix[10] * m.matrix[9] + this.matrix[11] * m.matrix[13],
      this.matrix[8] * m.matrix[2] + this.matrix[9] * m.matrix[6] + this.matrix[10] * m.matrix[10] + this.matrix[11] * m.matrix[14],
      this.matrix[8] * m.matrix[2] + this.matrix[9] * m.matrix[7] + this.matrix[10] * m.matrix[11] + this.matrix[11] * m.matrix[15],
      this.matrix[12] * m.matrix[0] + this.matrix[13] * m.matrix[4] + this.matrix[14] * m.matrix[8] + this.matrix[15] * m.matrix[12],
      this.matrix[12] * m.matrix[1] + this.matrix[13] * m.matrix[5] + this.matrix[14] * m.matrix[9] + this.matrix[15] * m.matrix[13],
      this.matrix[12] * m.matrix[2] + this.matrix[13] * m.matrix[6] + this.matrix[14] * m.matrix[10] + this.matrix[15] * m.matrix[14],
      this.matrix[12] * m.matrix[2] + this.matrix[13] * m.matrix[7] + this.matrix[14] * m.matrix[11] + this.matrix[15] * m.matrix[15],
      /* eslint-enable max-len */
  );
};

Matrix.prototype.invert = function () {
  const m = this.matrix;

  const inv = new Matrix(
      m[5] * m[10] * m[15] - // 0
    m[5] * m[11] * m[14] -
    m[9] * m[6] * m[15] +
    m[9] * m[7] * m[14] +
    m[13] * m[6] * m[11] -
    m[13] * m[7] * m[10],

      -m[1] * m[10] * m[15] + // 1
     m[1] * m[11] * m[14] +
     m[9] * m[2] * m[15] -
     m[9] * m[3] * m[14] -
     m[13] * m[2] * m[11] +
     m[13] * m[3] * m[10],

      m[1] * m[6] * m[15] - // 2
    m[1] * m[7] * m[14] -
    m[5] * m[2] * m[15] +
    m[5] * m[3] * m[14] +
    m[13] * m[2] * m[7] -
    m[13] * m[3] * m[6],

      -m[1] * m[6] * m[11] + // 3
     m[1] * m[7] * m[10] +
     m[5] * m[2] * m[11] -
     m[5] * m[3] * m[10] -
     m[9] * m[2] * m[7] +
     m[9] * m[3] * m[6],

      -m[4] * m[10] * m[15] + // 4
     m[4] * m[11] * m[14] +
     m[8] * m[6] * m[15] -
     m[8] * m[7] * m[14] -
     m[12] * m[6] * m[11] +
     m[12] * m[7] * m[10],

      m[0] * m[10] * m[15] - // 5
    m[0] * m[11] * m[14] -
    m[8] * m[2] * m[15] +
    m[8] * m[3] * m[14] +
    m[12] * m[2] * m[11] -
    m[12] * m[3] * m[10],

      -m[0] * m[6] * m[15] + // 6
     m[0] * m[7] * m[14] +
     m[4] * m[2] * m[15] -
     m[4] * m[3] * m[14] -
     m[12] * m[2] * m[7] +
     m[12] * m[3] * m[6],

      m[0] * m[6] * m[11] - // 7
    m[0] * m[7] * m[10] -
    m[4] * m[2] * m[11] +
    m[4] * m[3] * m[10] +
    m[8] * m[2] * m[7] -
    m[8] * m[3] * m[6],

      m[4] * m[9] * m[15] - // 8
    m[4] * m[11] * m[13] -
    m[8] * m[5] * m[15] +
    m[8] * m[7] * m[13] +
    m[12] * m[5] * m[11] -
    m[12] * m[7] * m[9],

      -m[0] * m[9] * m[15] + // 9
     m[0] * m[11] * m[13] +
     m[8] * m[1] * m[15] -
     m[8] * m[3] * m[13] -
     m[12] * m[1] * m[11] +
     m[12] * m[3] * m[9],

      m[0] * m[5] * m[15] - // 10
    m[0] * m[7] * m[13] -
    m[4] * m[1] * m[15] +
    m[4] * m[3] * m[13] +
    m[12] * m[1] * m[7] -
    m[12] * m[3] * m[5],

      -m[0] * m[5] * m[11] + // 11
     m[0] * m[7] * m[9] +
     m[4] * m[1] * m[11] -
     m[4] * m[3] * m[9] -
     m[8] * m[1] * m[7] +
     m[8] * m[3] * m[5],

      -m[4] * m[9] * m[14] + // 12
     m[4] * m[10] * m[13] +
     m[8] * m[5] * m[14] -
     m[8] * m[6] * m[13] -
     m[12] * m[5] * m[10] +
     m[12] * m[6] * m[9],

      m[0] * m[9] * m[14] - // 13
    m[0] * m[10] * m[13] -
    m[8] * m[1] * m[14] +
    m[8] * m[2] * m[13] +
    m[12] * m[1] * m[10] -
    m[12] * m[2] * m[9],

      -m[0] * m[5] * m[14] + // 14
    m[0] * m[6] * m[13] +
    m[4] * m[1] * m[14] -
    m[4] * m[2] * m[13] -
    m[12] * m[1] * m[6] +
    m[12] * m[2] * m[5],

      m[0] * m[5] * m[10] - // 15
    m[0] * m[6] * m[9] -
    m[4] * m[1] * m[10] +
    m[4] * m[2] * m[9] +
    m[8] * m[1] * m[6] -
    m[8] * m[2] * m[5],
  );

  let det = m[0] * inv[0] + m[1] * inv[4] + m[2] * inv[8] + m[3] * inv[12];

  if (det === 0) {
    return null;
  }

  det = 1 / det;

  for (let i = 0; i < 16; i++) {
    inv.matrix[i] = inv.matrix[i] * det;
  }

  return inv;
};

module.exports = {
  Matrix,
};
