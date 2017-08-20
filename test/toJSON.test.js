const las = require('../');
const path = require('path');

let data;

beforeAll(() => {
  return las
    .read(path.join(__dirname, 'data', 'malheur-or.las'))
    .toJSON()
    .then(jsondata => {
      data = jsondata;
    });
});

test('JSON object should have correct keys', () => {
  expect(Object.keys(data)).toEqual(['header', 'VLRs', 'points', 'EVLRs']);
});

test('ELVRs should be null if version is lower than 1.4', () => {
  if (data.header.versionMinor < 4) {
    expect(data.EVLRs).toBeNull();
  } else {
    expect(Array.isArray(data.EVLRs)).toBe(true);
  }
});

test('JSON structure has correct types', () => {
  expect(data.header instanceof Object).toBe(true);
  expect(Array.isArray(data.points)).toBe(true);
  expect(Array.isArray(data.VLRs)).toBe(true);
});
