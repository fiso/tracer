const {Random} = require('./prng');

const R = new Random(84736289);
const provider = R; // Or use Math

const rand = (n = 1) => provider.random() * n;
const randomElement = (array) => array[rand(array.length)];

module.exports = {
  rand,
  randomElement,
};
