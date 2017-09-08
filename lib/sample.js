const R = require('ramda');

/**
 * Take every `n` points.
 * Results in an array with length 1/n * original length
 * @param {number} number
 * @param {array} points
 */
const samplePoints = (n = 1, points = []) => {
  return points.filter((point, i) => {
    return i % n === 0;
  });
};

const sampleBinary = R.curry((number, binary) =>
  mapBinary(samplePoints, number, binary)
);

module.exports = {
  sampleBinary: sampleBinary,
  samplePoints: samplePoints
};
