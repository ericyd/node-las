const jBinary = require('jbinary');
const _read = require('./lib/read');
const _toJSON = require('./lib/toJSON');
const _write = require('./lib/write');
const _filter = require('./lib/filter');
const binaryTypeset = require('./lib/binaryTypeset');

const las = function(x) {
  this.__value = x;
};

las.of = function(x) {
  return new las(x);
};
las.read = _read;
las.prototype.map = function map(f) {
  return las.of(f(this.__value));
};
las.prototype.get = function get() {
  return this.__value;
};
las.prototype.write = _write;
las.prototype.toJSON = _toJSON;

function filterPoints(options) {
  return this.map(task => {
    return task.map(binary => {
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
      data.points = _filter(options, points);

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
  });
}

las.prototype.where = las.prototype.filterPoints = filterPoints;

module.exports = las;
