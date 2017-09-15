const { samplePoints } = require('../lib/sample');

test.skip('n should default to 1', () => {});

test('new length should be Math.ceil(1/n)', () => {
  // 0 items
  let a = [];
  let n = 2;
  expect(samplePoints(n, a).length).toEqual(0);

  // even number of items
  a = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l'];
  for (n = 1; n < 6; n++) {
    expect(samplePoints(n, a).length).toEqual(Math.ceil(a.length * 1 / n));
  }

  // odd number of items
  a = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm'];
  for (n = 1; n < 6; n++) {
    expect(samplePoints(n, a).length).toEqual(Math.ceil(a.length * 1 / n));
  }
});
