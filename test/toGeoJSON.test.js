/**
 * This test just verifies that the resulting JSON object complies with the spec.
 */

const las = require('../');
const path = require('path');

let data;

beforeAll(() => {
  return las
    .read(path.join(__dirname, 'data', 'malheur-or.las'))
    .toGeoJSON()
    .then(geoJSON => {
      data = geoJSON;
    });
});

test('GeoJSON object should have type "FeatureCollection"', () => {
  expect(data.type).toEqual('FeatureCollection');
});

test('GeoJSON object should have member "features"', () => {
  expect(data.features).toBeTruthy();
});

test('member "features" should be an array', () => {
  expect(Array.isArray(data.features)).toBe(true);
});

test('each "feature" should have type "Feature"', () => {
  data.features.forEach(feature => {
    expect(feature.type).toEqual('Feature');
  });
});

test('each "feature" should have member "properties"', () => {
  data.features.forEach(feature => {
    expect(feature.properties).toBeTruthy();
  });
});

test('each "feature" should have a member "geometry"', () => {
  data.features.forEach(feature => {
    expect(feature.geometry).toBeTruthy();
  });
});

test('each "geometry" should be a point', () => {
  data.features.forEach(feature => {
    expect(feature.geometry.type).toEqual('Point');
  });
});

test('each "Point" should have a coordinates array with three items', () => {
  data.features.forEach(feature => {
    expect(Array.isArray(feature.geometry.coordinates)).toBe(true);
    expect(feature.geometry.coordinates.length).toEqual(3);
  });
});
