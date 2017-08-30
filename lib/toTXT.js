const R = require('ramda');

const joinText = textArray => textArray.map(line => line.join(',')).join('\n');

/**
 * convert a JSON object to an array of arrays,
 * where each inner array will be a line in a text file (ascii)
 * representation of the LAS point data
 * @param {lasObject} json 
 */
const jsonToTxt = (columns, json) => {
  return joinText(
    R.concat(
      [columns],
      json.points.map(R.props(columns))
    )
  );
};

const toTXT = function (columns = ['x', 'y', 'z']) {
  return new Promise((resolve, reject) => {
    this.__value.fork(reject, function (binary) {
      resolve(jsonToTxt(columns, binary.readAll()));
    });
  });
};

module.exports = toTXT;