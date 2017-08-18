const jBinary = require('jbinary');
const lasTypeset = require('./binaryTypeset');

/**
 * Write the contents of the LAS object to file
 * @param {string} file
 * @return {promise}
 */
const write = function(file) {
  return new Promise((resolve, reject) => {
    this.get().fork(reject, function(binary) {
      // TODO: I don't think this is necessary at all because the binary.view should already
      // have an up-to-date buffer
      // binary.writeAll(binary.readAll());
      binary.saveAs(file, (err, data) => {
        if (err) reject(err);
        resolve(data);
      });
    });
  });
};

module.exports = write;
