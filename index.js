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
      const versionMinor = binary.read('uint8', 25);
      const headerSize = binary.read('uint16', 94);
      const offsetToPoints = binary.read('uint32', 96);
      const pointFormatType = binary.read('uint8', 104);
      const pointFormat = binary.typeSet[`pointFormat${pointFormatType}`];
      const numberOfPoints =
        versionMinor < 4
          ? binary.read('uint32', 107)
          : binary.read('uint64', headerSize - 15 * 8);

      const points = binary.read(
        ['array', pointFormat, numberOfPoints],
        offsetToPoints
      );
      const filteredPoints = _filter(options, points);
      binary.write(
        ['array', pointFormat, filteredPoints.length],
        filteredPoints,
        offsetToPoints
      );
      // TODO: are these properties necessary?
      const versionMajor = binary.read('uint8', 24);
      const pointDataLength = binary.read('uint16', 105);
      return binary;
    });
  });
}

las.prototype.where = las.prototype.filterPoints = filterPoints;

module.exports = las;
