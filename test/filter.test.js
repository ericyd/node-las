const fs = require('fs');
const path = require('path');
const mockfs = require('mock-fs');
const R = require('ramda');
const las = require('../');
const { filter, testDataToComparators } = require('../lib/filter');
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

const handleError = R.curry((done, err) => {
  log(err);
  expect(err).toBeFalsy();
  done();
});

test('should return identical JSON when filter is empty', done => {
  const inputPath = path.join(__dirname, 'data', 'malheur-or.las');
  const outputPath = path.join(__dirname, 'data', 'sample.las');
  const input = fs.readFileSync(inputPath);

  mockfs({
    'test/data': {
      'malheur-or.las': input
    }
  });

  las
    .read(inputPath)
    .where({})
    .write(outputPath, { returnJSON: true })
    .then(expected => {
      return Promise.all([
        Promise.resolve(expected),
        las.read(outputPath).toJSON()
      ]);
    })
    .then(([expected, actual]) => {
      expect(actual).toEqual(expected);
      done();
    })
    .catch(handleError(done));
});

test.only('generate comparators', () => {
  // const list = [
  //   ['x', R.lt(R.__, 5)],
  //   ['y', R.gt(R.__, 6)],
  //   ['z', R.lt(R.__, 10)]
  // ];
  const list = [['x', ['lt', 5]], ['y', ['gt', 6]], ['z', ['lt', 10]]];
  const data = {
    x: 4,
    y: 7,
    z: 9
  };
  log(testDataToComparators(list, data));
});
