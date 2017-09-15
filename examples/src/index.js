// node-las/index.js
import * as las from '../../';
import * as THREE from 'three';
import * as turf from '@turf/turf';
import * as path from 'path';

const handleError = err => {
  console.log(err);
  alert(err);
};

const lasPath = path.normalize('../malheur-or.las');

las
  .read(lasPath)
  .toGeoJSON()
  .then(geojson => {
    const TIN = turf.tin(geojson);
    console.log(TIN);
  }, handleError)
  .catch(handleError);
