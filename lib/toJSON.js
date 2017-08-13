const toJSON = function() {
  return this.__value.fork(
    function(error) {
      throw error;
    },
    function(data) {
      console.log(data);
    }
  );
};

module.exports = toJSON;
