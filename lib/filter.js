const R = require('ramda');

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
const testDataToComparators = (list, data) =>
  list.map(([prop, func]) =>
    R.or(
      R.apply(getFunc(R.head(func)), arrangeArgs(prop, data, func)),
      // if prop is nil, no need to exclude point for that comparator function
      isNilProp(prop, data)
    )
  );

const filterWith = R.curry((options, point) =>
  allTrue(testDataToComparators(Object.entries(options), point))
);

/**
 * Provides method of removing point data based on the options supplied
 * @param {object} options must contain key value pairs where keys are properties of a Point
 * and values are comparator functions, such as lt for less than
 * @param {array} points
 * @return
 */
const filter = (options = {}, points = []) => {
  filterWithOptions = filterWith(options);
  return points.filter(filterWithOptions);
};

filter.__testonly__ = {
  testDataToComparators: testDataToComparators,
  filterWith: filterWith,
  betweenLazy: betweenLazy,
  between: between
};

module.exports = filter;
