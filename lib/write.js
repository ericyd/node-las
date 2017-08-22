const jBinary = require('jbinary');
const lasTypeset = require('./binaryTypeset');

/**
 * Write the contents of the LAS object to file
 * @param {string} file
 * @return {promise}
 */
const write = function(file, options = {}) {
  return new Promise((resolve, reject) => {
    this.get().fork(reject, function(binary) {
      binary.saveAs(file, (err, data) => {
        if (err) reject(err);
        if (options.returnJSON) resolve(binary.readAll());
        else resolve(data);
      });
    });
  });
};

module.exports = write;
