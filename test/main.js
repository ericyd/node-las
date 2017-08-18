// const jBinary = require('jbinary');
// const lasTypeset = require('./lib/binaryTypeset');
// const fs = require('fs');

// jBinary
//   .load('test/data/malheur-or.las', lasTypeset)
//   .then(function(jb /* : jBinary */) {
//     // read everything using type aliased in lasTypeset['jBinary.all']
//     var data = jb.readAll();

//     // do something with data in las file
//     fs.writeFileSync('example-output.js', JSON.stringify(data));

//     jb.seek(0); // reusing same instance (and memory buffer) by resetting pointer
//     jb.writeAll(data); // writing entire content from data
//     jb.saveAs('sample.new.las'); // saving file under given name
//   })
//   .catch(console.log.bind(console));

const las = require('../index');

const res = las
  .read('test/data/malheur-or.las')
  // .toJSON()
  .where({})
  .write('sample.las')
  // .then(data => console.log(data))
  .catch(console.log.bind(console));
// console.log(res);
