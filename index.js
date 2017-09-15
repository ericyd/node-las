const jBinary = require('jbinary');
const R = require('ramda');
const read = require('./lib/read');
const toJSON = require('./lib/toJSON');
const toGeoJSON = require('./lib/toGeoJSON');
const toTXT = require('./lib/toTXT');
const write = require('./lib/write');
const { filterBinary } = require('./lib/filter');
const { sampleBinary } = require('./lib/sample');
const binaryTypeset = require('./lib/binaryTypeset');

const las = function(x) {
  this.__value = x;
};

las.of = function(x) {
  return new las(x);
};
las.read = read;
las.prototype.map = function map(f) {
  return las.of(f(this.__value));
};
las.prototype.get = function get() {
  return this.__value;
};
las.prototype.write = write;
las.prototype.toJSON = toJSON;
las.prototype.toTXT = toTXT;
las.prototype.toGeoJSON = toGeoJSON;

function filterPoints(options) {
  return this.map(task => {
    const filterWithOpts = filterBinary(options);
    return task.map(filterWithOpts);
  });
}

las.prototype.where = las.prototype.filterPoints = filterPoints;

function samplePoints(number) {
  return this.map(task => {
    const sampleN = sampleBinary(number);
    return task.map(sampleN);
  });
}

las.prototype.sample = samplePoints;

module.exports = las;
