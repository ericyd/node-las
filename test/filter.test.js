const fs = require('fs');
const path = require('path');
const mockfs = require('mock-fs');
const R = require('ramda');
const las = require('../');
const { filter, testDataToComparators, filterWith } = require('../lib/filter');
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

test('comparator functions should return correctly', () => {
  const list = [['x', ['lt', 5]], ['y', ['gt', 6]], ['z', ['lt', 10]]];
  const data = {
    x: 4,
    y: 7,
    z: 9
  };
  expect(testDataToComparators(list, data)).toEqual([4 < 5, 7 > 6, 9 < 10]);
});

describe('less than', () => {
  test('should be able to use `lt`, `less than` or `lessThan` equivalently', () => {
    const options = {
      x: ['lt', 5],
      y: ['lessThan', 5],
      z: ['less than', 5]
    };
    const data1 = {
      x: 4,
      y: 4,
      z: 4
    };
    const data2 = {
      x: 5,
      y: 5,
      z: 5
    };
    expect(filterWith(options, data1)).toEqual(true);
    expect(filterWith(options, data2)).toEqual(false);
  });

  test('`lt`, `less than`, or `lessThan` should all return the same lists', () => {
    const options = {
      x: ['lt', 5],
      y: ['lessThan', 5],
      z: ['less than', 5]
    };
    const data1 = {
      x: 4,
      y: 4,
      z: 4
    };
    const data2 = {
      x: 5,
      y: 5,
      z: 5
    };
    expect(testDataToComparators(Object.entries(options), data1)).toEqual([
      true,
      true,
      true
    ]);
    expect(testDataToComparators(Object.entries(options), data2)).toEqual([
      false,
      false,
      false
    ]);
  });
});

describe('greater than', () => {
  test('should be able to use `gt`, `greater than`, or `greaterThan`', () => {
    const options = {
      x: ['gt', 5],
      y: ['greaterThan', 5],
      z: ['greater than', 5]
    };
    const data1 = {
      x: 6,
      y: 6,
      z: 6
    };
    const data2 = {
      x: 5,
      y: 5,
      z: 5
    };
    expect(filterWith(options, data1)).toEqual(true);
    expect(filterWith(options, data2)).toEqual(false);
  });

  test('`gt`, `greater than`, or `greaterThan` should all return the same lists', () => {
    const options = {
      x: ['gt', 5],
      y: ['greaterThan', 5],
      z: ['greater than', 5]
    };
    const data1 = {
      x: 6,
      y: 6,
      z: 6
    };
    const data2 = {
      x: 5,
      y: 5,
      z: 5
    };
    expect(testDataToComparators(Object.entries(options), data1)).toEqual([
      true,
      true,
      true
    ]);
    expect(testDataToComparators(Object.entries(options), data2)).toEqual([
      false,
      false,
      false
    ]);
  });
});

test('should be able to use `between` (exclusive)', () => {
  const options = {
    x: ['between', 5, 10],
    x: ['between', 5, 10],
    x: ['between', 5, 10]
  };
  const data = {
    x: 6,
    y: 5,
    z: 10
  };
  expect(filterWith(options, data)).toBe(false);
  expect(testDataToComparators(Object.entries(options), data)).toEqual([
    true,
    false,
    false
  ]);
});

describe('equal', () => {
  test('should be able to use `eq`, `equal`, or `equals`', () => {
    const options = {
      x: ['eq', 5],
      y: ['equal', 5],
      z: ['equals', 5]
    };
    const data1 = {
      x: 5,
      y: 6,
      z: 5
    };
    const data2 = {
      x: 5,
      y: 5,
      z: 5
    };
    expect(filterWith(options, data1)).toEqual(false);
    expect(filterWith(options, data2)).toEqual(true);
  });

  test('`eq`, `equal`, or `equals` should all return the same lists', () => {
    const options = {
      x: ['eq', 5],
      y: ['equal', 5],
      z: ['equals', 5]
    };
    const data1 = {
      x: 5,
      y: 6,
      z: 5
    };
    const data2 = {
      x: 4,
      y: 3,
      z: 5
    };
    expect(testDataToComparators(Object.entries(options), data1)).toEqual([
      true,
      false,
      true
    ]);
    expect(testDataToComparators(Object.entries(options), data2)).toEqual([
      false,
      false,
      true
    ]);
  });
});

test('filters and data should be able to have different properties', () => {
  const options = {
    x: ['lt', 5],
    yes: ['gt', 5],
    zed: ['eq', 5]
  };
  const data = {
    x: 6,
    y: 5,
    z: 10,
    nomnomnom: 11
  };
  expect(filterWith(options, data)).toBe(true);
  expect(testDataToComparators(Object.entries(options), data)).toEqual([
    true,
    true,
    true,
    true
  ]);
});

test('should be able to ');
