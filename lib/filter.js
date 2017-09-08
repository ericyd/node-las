const R = require('ramda');
const jBinary = require('jbinary');
const binaryTypeset = require('./binaryTypeset');

const between = R.curry((val, low, high) =>
  R.and(R.gt(val, low), R.lt(val, high))
);
const betweenLazy = (val, one, two) =>
  R.or(between(val, one, two), between(val, two, one));

const funcMap = {
  lt: R.lt,
  lessThan: R.lt,
  'less than': R.lt,
  gt: R.gt,
  greaterThan: R.gt,
  'greater than': R.gt,
  eq: R.equals,
  equal: R.equals,
  equals: R.equals,
  between: betweenLazy
};

const getFunc = R.prop(R.__, funcMap);
const allTrue = R.all(t => t === true);
const isNilProp = R.compose(R.isNil, R.prop);
const arrangeArgs = (prop, data, func) =>
  R.concat(R.of(R.prop(prop, data)), R.tail(func));

/**
 * @param {Array} list a list of [prop, func] tuples. func must be curried and have arity of 1
 * @param {object} data
 * @return {Array} list of booleans - results of func(data[prop])
 */
const testAll = (list, data) =>
  list.map(([prop, func]) =>
    R.or(
      R.apply(getFunc(R.head(func)), arrangeArgs(prop, data, func)),
      // if prop is nil, no need to exclude point for that comparator function
      isNilProp(prop, data)
    )
  );

const filterWith = R.curry((options, point) =>
  allTrue(testAll(Object.entries(options), point))
);

/**
 * Provides method of removing point data based on the options supplied
 * @param {object} options must contain key value pairs where keys are properties of a Point
 * and values are comparator functions, such as lt for less than
 * @param {array} points
 * @return
 */
const filterPoints = (options = {}, points = []) => {
  filterWithOptions = filterWith(options);
  return points.filter(filterWithOptions);
};

const filterBinary = R.curry((options, binary) => {
  const data = binary.readAll();
  const header = data.header;
  const pointFormat = binary.typeSet[`pointFormat${header.pointFormat}`];
  const numberOfPoints =
    header.versionMinor < 4
      ? header.legacyNumberOfPoints
      : header.numberOfPoints;
  const points = binary.read(
    ['array', pointFormat, numberOfPoints],
    header.offsetToPoints
  );
  const oldLength = data.points.length;
  data.points = filterPoints(options, points);

  // Must create new instance rather than mutate existing because memory is statically allocated.
  // New size is based on new number of points
  // https://github.com/jDataView/jBinary/issues/48
  const newLength =
    binary.view.byteLength -
    (oldLength - data.points.length) *
      binary.typeSet.sizes[`pointFormat${header.pointFormat}`];
  const newBinary = new jBinary(newLength, binaryTypeset);
  newBinary.writeAll(data);

  return newBinary;
});

module.exports = {
  filterBinary: filterBinary,
  filterPoints: filterPoints,
  testAll: testAll,
  filterWith: filterWith,
  betweenLazy: betweenLazy,
  between: between
};
