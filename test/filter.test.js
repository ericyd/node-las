const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const R = require('ramda');
const mockfs = require('mock-fs');
const las = require('../');
const filter = require('../lib/filter');
const { log } = require('../lib/helpers');

test('should return same points if empty filter options are passed', () => {
  const points = [1, 2, 3];
  const filteredPoints = filter({}, points);
  expect(filteredPoints).toEqual(points);
});

// define helper functions for comparing files
const getHashByAlgorithm = R.curry((algorithm, hashType, data) =>
  crypto.createHash(algorithm).update(data).digest(hashType)
);
const md5 = getHashByAlgorithm('md5', 'hex');
const sha256 = getHashByAlgorithm('sha256', 'hex');

afterAll(() => {
  mockfs.restore();
});

test('should write an identical file if filtered with empty options', done => {
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
    .filterPoints({})
    .write(outputPath)
    .then(() => {
      const output = fs.readFileSync(outputPath);
      const outputMD5 = md5(output);
      const outputSHA256 = sha256(output);
      expect(outputMD5).toEqual(inputMD5);
      expect(outputSHA256).toEqual(inputSHA256);
      done();
    })
    .catch(log);
});
