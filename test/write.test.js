const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const R = require('ramda');
const jBinary = require('jbinary');
const lasTypeset = require('../lib/binaryTypeset');

// define helper functions for comparing files
const getHashByAlgorithm = R.curry((algorithm, hashType, data) =>
  crypto.createHash(algorithm).update(data).digest(hashType)
);
const md5 = getHashByAlgorithm('md5', 'hex');
const sha256 = getHashByAlgorithm('sha256', 'hex');

test('output file should match input file', done => {
  const input = fs.readFileSync(path.join(__dirname, 'data', 'malheur-or.las'));
  const inputHash = md5(input);

  jBinary
    .load(path.join(__dirname, 'data', 'malheur-or.las'), lasTypeset)
    .then(function(jb /* : jBinary */) {
      // read everything using type aliased in lasTypeset['jBinary.all']
      var data = jb.readAll();
      jb.seek(0); // reusing same instance (and memory buffer) by resetting pointer
      jb.writeAll(data); // writing entire content from data
      jb.saveAs('sample.new.las'); // saving file under given name
    })
    .catch(console.log.bind(console));

  const output = fs.readFileSync('sample.new.las');
  const outputHash = md5(output);
  expect(outputHash).toEqual(inputHash);
});
