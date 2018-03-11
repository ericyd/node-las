const fs = require('fs');
const path = require('path');
const mockfs = require('mock-fs');
const las = require('../');
const { log } = require('../lib/helpers');
const { sha256 } = require('./util');

afterAll(() => {
  mockfs.restore();
});

test('output file should match input file', done => {
  const inputPath = path.join(__dirname, 'data', 'malheur-or.las');
  const outputPath = path.join(__dirname, 'data', 'sample2.las');
  const input = fs.readFileSync(inputPath);
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
      const outputSHA256 = sha256(output);
      expect(outputSHA256).toEqual(inputSHA256);
      done();
    })
    .catch(log);
});
