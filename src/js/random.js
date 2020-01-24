const {Random} = require('./prng');

const R = new Random(1);
let provider = R; // Or use Math

function reseed (seed) {
  provider = new Random(seed);
}

const rand = (n = 1) => provider.random() * n;
const randomElement = (array) => array[rand(array.length)];

module.exports = {
  rand,
  randomElement,
  reseed,
};
