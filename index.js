const _read = require('./lib/read');
const _toJSON = require('./lib/toJSON');

const las = function(x) {
  this.__value = x;
};

las.read = _read;
las.toJSON = _toJSON;

module.exports = las;
