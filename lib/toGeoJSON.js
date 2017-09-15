/**
 * Returns a Promise that resolves with a GeoJSON FeatureCollection<points> object.
 * Each Feature in the FeatureCollection contains the full properties of the LAS Point
 * in the `properties` member.
 */
const toGeoJSON = function() {
  return new Promise((resolve, reject) => {
    this.__value.fork(reject, function(binary) {
      resolve({
        type: 'FeatureCollection',
        features: binary.readAll().points.map(p => {
          return {
            type: 'Feature',
            // properties is a required member (GeoJSON https://tools.ietf.org/rfc/rfc7946.txt section 3.2)
            // but nothing is required to be here... maybe include props other than x,y,z?
            properties: p,
            geometry: {
              type: 'Point',
              coordinates: [p.x, p.y, p.z]
            }
          };
        })
      });
    });
  });
};

module.exports = toGeoJSON;
