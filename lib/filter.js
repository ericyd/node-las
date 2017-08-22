const R = require('ramda');

const funcMap = {
  lt: R.lt,
  gt: R.gt
};

/**
 * @param {Array} list a list of [prop, func] tuples. func must be curried and have arity of 1
 * @param {object} data
 * @return {Array} list of booleans - results of func(data[prop])
 */
const testDataToComparators = (list, data) => {
  return list.map(([prop, func]) => funcMap[func[0]](data[prop], func[1]));
};

const filterWithOptions = R.curry((options, point) => {
  // R.none(generateComparators(Object.entries(options), point));

  // !value(point[key]);
  // let returnVal = true;
  [].forEach(([key, value]) => {
    if (!value(point[key])) returnVal = false;
  });
  return returnVal;
});

/**
 * Provides method of removing point data based on the options supplied
 * @param {object} options must contain key value pairs where keys are properties of a Point
 * and values are comparator functions, such as lt for less than
 * @param {array} points
 * @return
 */
const filter = (options = {}, points = []) => {
  // const customFilter = filterWithOptions(options);
  // const filtered = points.filter(customFilter);
  // return filtered;
  return points;
};

module.exports = {
  filter: filter,
  testDataToComparators: testDataToComparators
};
