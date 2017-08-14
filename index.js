const _read = require('./lib/read');
const _toJSON = require('./lib/toJSON');
const _write = require('./lib/write');

const las = function(x) {
  this.__value = x;
};

las.of = x => new las(x);
las.read = _read;
las.prototype.write = _write;
las.prototype.toJSON = _toJSON;

module.exports = las;
