const toJSON = function() {
  return new Promise((resolve, reject) => {
    this.__value.fork(reject, function(binary) {
      resolve(binary.readAll());
    });
  });
};

module.exports = toJSON;
