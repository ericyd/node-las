const jBinary = require('jbinary');
const R = require('ramda');
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
    const filterWithOpts = _filter(options);
    return task.map(filterWithOpts);
  });
}

las.prototype.where = las.prototype.filterPoints = filterPoints;

module.exports = las;
