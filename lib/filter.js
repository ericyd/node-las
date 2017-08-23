const R = require('ramda');

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
  between: x => console.log('to be defined')
};

const getFunc = R.prop(R.__, funcMap);
const allTrue = R.all(t => t === true);

/**
 * @param {Array} list a list of [prop, func] tuples. func must be curried and have arity of 1
 * @param {object} data
 * @return {Array} list of booleans - results of func(data[prop])
 */
const testDataToComparators = (list, data) =>
  list.map(([prop, func]) =>
    R.apply(
      getFunc(R.head(func)),
      R.concat(R.of(R.prop(prop, data)), R.tail(func))
    )
  );

const filterWith = R.curry((options, point) => {
  // const res = testDataToComparators(Object.entries(options), point);
  // console.log(options, point, res, allTrue(res));
  return allTrue(testDataToComparators(Object.entries(options), point));
});

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

module.exports = {
  filter: filter,
  testDataToComparators: testDataToComparators,
  filterWith: filterWith
};
