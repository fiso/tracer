// https://gist.github.com/blixt/f17b47c62508be59987b

const seedStep = 2147483646;
const divisor = seedStep + 1;

// Creates a pseudo-random value generator. The seed must be an integer.
// Uses an optimized version of the Park-Miller PRNG.
// http://www.firstpr.com.au/dsp/rand31/
function Random (seed) {
  seed = Math.floor(seed);
  this._seed = seed % divisor;
  if (this._seed <= 0) {
    this._seed += seedStep;
  }
}

// Returns a pseudo-random value between 1 and 2^32 - 2.
Random.prototype.randomInt = function () {
  return this._seed = this._seed * 16807 % divisor;
};

// Returns a pseudo-random floating point number in range [0, 1).
Random.prototype.random = function () {
  // We know that result of randomInt() will be 1 to seedStep (inclusive).
  return (this.randomInt() - 1) / seedStep;
};

module.exports = {
  Random,
};
