const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const R = require('ramda');
const mockfs = require('mock-fs');
const las = require('../');

// define helper functions for comparing files
const getHashByAlgorithm = R.curry((algorithm, hashType, data) =>
  crypto.createHash(algorithm).update(data).digest(hashType)
);
const md5 = getHashByAlgorithm('md5', 'hex');
const sha256 = getHashByAlgorithm('sha256', 'hex');

afterAll(() => {
  mockfs.restore();
});

test('output file should match input file', done => {
  const inputPath = path.join(__dirname, 'data', 'malheur-or.las');
  const outputPath = path.join(__dirname, 'data', 'sample2.las');
  const input = fs.readFileSync(inputPath);
  const inputMD5 = md5(input);
  const inputSHA256 = sha256(input);

  mockfs({
    'test/data': {
      'malheur-or.las': input
    }
  });

  las
    .read(inputPath)
    .write(outputPath)
    .then(() => {
      const output = fs.readFileSync(outputPath);
      const outputMD5 = md5(output);
      const outputSHA256 = sha256(output);
      expect(outputMD5).toEqual(inputMD5);
      expect(outputSHA256).toEqual(inputSHA256);
      done();
    })
    .catch(console.log.bind(console));
});
