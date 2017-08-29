const las = require('../');
const path = require('path');

let data;

beforeAll(() => {
  return las
    .read(path.join(__dirname, 'data', 'malheur-or.las'))
    .toTXT()
    .then(textdata => {
      data = textdata;
    });
});

test('console log the result', () => {
  console.log(data);
});
