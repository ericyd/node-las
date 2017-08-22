const fs = require('fs');
const path = require('path');
const mockfs = require('mock-fs');
const las = require('../');
const filter = require('../lib/filter');
const { log } = require('../lib/helpers');
const { sha256 } = require('./util');

test('should return same points if empty filter options are passed', () => {
  const points = [1, 2, 3];
  const filteredPoints = filter({}, points);
  expect(filteredPoints).toEqual(points);
});

afterAll(() => {
  mockfs.restore();
});

test('should write an identical file if filtered with empty options', done => {
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
    .where({})
    .write(outputPath)
    .then(() => {
      const output = fs.readFileSync(outputPath);
      const outputSHA256 = sha256(output);
      expect(outputSHA256).toEqual(inputSHA256);
      done();
    })
    .catch(err => {
      log(err);
      expect(err).toBeFalsy();
      done();
    });
});
