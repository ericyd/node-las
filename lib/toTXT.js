const R = require('ramda');

const joinText = textArray => textArray.map(line => line.join(',')).join('\n');

/**
 * convert a JSON object to an array of arrays,
 * where each inner array will be a line in a text file (ascii)
 * representation of the LAS point data
 * @param {lasObject} json 
 */
const jsonToTxt = json => {
  return joinText(
    R.concat(
      [['x', 'y', 'z']],
      Object.values(json.points).map(point => [point.x, point.y, point.z])
    )
  );
};

const toTXT = function() {
  return new Promise((resolve, reject) => {
    this.__value.fork(reject, function(binary) {
      resolve(jsonToTxt(binary.readAll()));
    });
  });
};

module.exports = toTXT;
