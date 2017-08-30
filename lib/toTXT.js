const R = require('ramda');

// [[a]] --> a
const joinText = textArray => textArray.map(line => line.join(',')).join('\n');

/**
 * convert a JSON object to an array of arrays,
 * where each inner array will be a line in a text file (ascii)
 * representation of the LAS point data
 * @param {[string]} columns the columns to include in the text output
 * @param {lasObject} json
 */
const jsonToTxt = (columns, json) =>
  joinText(R.concat([columns], json.points.map(R.props(columns))));

/**
 * Returns a Promise which resolves with a text (ascii) representation of the
 * LAS file point data.
 * @param {[string]} columns the columns to include in the text output
 */
const toTXT = function(columns = ['x', 'y', 'z']) {
  return new Promise((resolve, reject) => {
    this.__value.fork(reject, function(binary) {
      resolve(jsonToTxt(columns, binary.readAll()));
    });
  });
};

module.exports = toTXT;
