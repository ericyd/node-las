const { samplePoints } = require('../lib/sample');

test.skip('n should default to 1', () => {});

test('new length should be Math.floor(1/n)', () => {
  const a = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l'];
  let n = 2;
  expect(samplePoints(n, a).length).toEqual(Math.floor(a.length * 1 / n));
  n = 3;
  expect(samplePoints(n, a).length).toEqual(Math.floor(a.length * 1 / n));
  n = 4;
  expect(samplePoints(n, a).length).toEqual(Math.floor(a.length * 1 / n));
});
