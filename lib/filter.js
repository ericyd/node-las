const R = require('ramda');
const filterWithOptions = R.curry((options, point) => {
  let returnVal = true;
  Object.entries(options).forEach(([key, value]) => {
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
  const customFilter = filterWithOptions(options);
  const filtered = points.filter(customFilter);
  // return filtered;
  return points;
};

module.exports = filter;
