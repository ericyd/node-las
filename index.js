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
      // binary.read takes a data type and an offset in bytes
      const header = binary.read(binary.typeSet.header, 0);
      const pointFormat =
        binary.typeSet[`pointFormat${header.pointFormatType}`];
      const numberOfPoints =
        header.versionMinor < 4
          ? header.legacyNumberOfPoints
          : header.numberOfPoints;

      const points = binary.read(
        ['array', pointFormat, numberOfPoints],
        header.offsetToPoints
      );
      const filteredPoints = _filter(options, points);
      binary.write(
        ['array', pointFormat, filteredPoints.length],
        filteredPoints,
        header.offsetToPoints
      );
      return binary;
    });
  });
}

las.prototype.where = las.prototype.filterPoints = filterPoints;

module.exports = las;
