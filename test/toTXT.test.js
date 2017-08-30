const las = require('../');
const path = require('path');

let data;

beforeAll(() => {
  data = las.read(path.join(__dirname, 'data', 'malheur-or.las'));
});

test('columns should default to `x,y,z`', done => {
  data
    .toTXT()
    .then(textdata => {
      expect(textdata.split('\n')[0]).toEqual('x,y,z');
      done();
    })
    .catch(console.error.bind(console));
});

test('custom columns should be included in the header row', done => {
  const columns = ['x', 'y', 'intensity', 'returnNumber', 'z'];
  data
    .toTXT(columns)
    .then(text => {
      expect(text.split('\n')[0]).toEqual(columns.join(','));
      done();
    })
    .catch(console.error.bind(console));
});

test('custom columns should return custom data', done => {
  const columns = ['x', 'y', 'intensity', 'returnNumber', 'z'];
  data
    .toTXT(columns)
    .then(text => {
      return Promise.all([Promise.resolve(text), data.toJSON()]);
    })
    .then(([text, json]) => {
      const rows = text.split('\n');
      const firstRow = rows[1];
      const firstJsonPoint = json.points[0];
      expect(firstRow).toEqual(
        [
          firstJsonPoint.x,
          firstJsonPoint.y,
          firstJsonPoint.intensity,
          firstJsonPoint.returnNumber,
          firstJsonPoint.z
        ].join(',')
      );
      done();
    })
    .catch(console.error.bind(console));
});
