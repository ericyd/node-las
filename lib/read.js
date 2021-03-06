const Task = require('data.task');
const jBinary = require('jbinary');
const lasTypeset = require('./binaryTypeset');

/**
 * Read a LAS file and return a JSON object representation of the data.
 * @param {string} file 
 * @return {object}
 */
const read = function(file) {
  return this.of(
    new Task(function(reject, resolve) {
      jBinary
        .load(file, lasTypeset)
        .then(
          function(binary) {
            // read everything using type aliased in lasTypeset['jBinary.all']
            resolve(binary);

            // // do something with data in las file
            // fs.writeFileSync('example-output.js', JSON.stringify(data));

            // jb.seek(0); // reusing same instance (and memory buffer) by resetting pointer
            // jb.writeAll(data); // writing entire content from data
            // jb.saveAs('sample.new.las'); // saving file under given name
          },
          err => reject(err)
        )
        .catch(err => reject(err));
    })
  );
};

module.exports = read;
