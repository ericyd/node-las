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
      // versionMajor and minor are 24 and 25 bytes offset from the start of the file, respectively
      const versionMajor = binary.read('uint8', 24);
      const versionMinor = binary.read('uint8', 25);
      // offsetToPoints is 96 bytes offset
      const offsetToPoints = binary.read('uint32', 96);
      // number of bytes in the point records
      const pointDataLength = binary.read('uint16', 105);
      binary.seek(0);
      const data = binary.readAll();
      // TODO: could probably read point data using the point data format declared in the typeset
      const filteredPoints = _filter({}, data.pointData);
      // console.log(data.pointData.length, filteredPoints.length);
      // console.log(binaryTypeset.pointFormat1);
      // console.log(offsetToPoints);
      // const pointBeforeWrite = binary.read(
      //   binaryTypeset.pointFormat1,
      //   offsetToPoints
      // );
      // console.log(pointBeforeWrite);
      binary.write(
        // TODO: point data format needs to be dynamic
        ['array', binaryTypeset.pointFormat1, filteredPoints.length],
        filteredPoints,
        offsetToPoints
      );

      // const pointAfterWrite = binary.read(
      //   binaryTypeset.pointFormat1,
      //   offsetToPoints
      // );
      // console.log(pointAfterWrite);
      return binary;
    });
  });
}

las.prototype.where = las.prototype.filterPoints = filterPoints;

module.exports = las;
