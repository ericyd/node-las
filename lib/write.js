const jBinary = require('jbinary');
const lasTypeset = require('./binaryTypeset');

/**
 * Write the contents of the LAS object to file
 * @param {string} file
 * @return {promise}
 */
const write = function(file) {
  return new Promise((resolve, reject) => {
    this.__value.fork(reject, function(binary) {
      // TODO: I believe in practice I will want to access binary.contexts when writing the file
      binary.writeAll(binary.readAll());
      binary.saveAs(file, (err, data) => {
        if (err) reject(err);
        resolve(data);
      });
    });
  });
};

module.exports = write;
