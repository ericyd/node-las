// node-las/index.js
import * as las from '../../';
import * as THREE from 'three';
import * as turf from '@turf/turf';
import * as path from 'path';

const handleError = err => {
  console.error(err);
  alert(err);
};

const lasPath = path.normalize('../points.las');

var minx;
var miny;
var minz;
var maxx;
var maxy;
var maxz;

var SEPARATION = 100;
var AMOUNTX = 50;
var AMOUNTY = 50;

var container, stats;
var camera, scene, renderer, particle;
var mouseX = 0,
  mouseY = 0;

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

las
  .read(lasPath)
  .toGeoJSON()
  .then(geojson => {
    const TIN = turf.tin(geojson);
    console.log(TIN);

    // extract the normal json points
    var points = geojson.features.map(function(f) {
      return f.properties;
    });

    var xs = points.map(function(p) {
      return p.x;
    });
    var ys = points.map(function(p) {
      return p.y;
    });
    var zs = points.map(function(p) {
      return p.z;
    });

    minx = Math.min.apply(null, xs);
    miny = Math.min.apply(null, ys);
    minz = Math.min.apply(null, zs);
    maxx = Math.max.apply(null, xs);
    maxy = Math.max.apply(null, ys);
    maxz = Math.max.apply(null, zs);

    init(TIN);
  }, handleError)
  .catch(handleError);

animate();

function init(tin) {
  // transforms it into an array of arrays,
  // where each outer array has four inner arrays: three vertices and one duplicate to close the polygon
  // each inner array has three values: x,y,z
  tin = tin.features.map(function(f) {
    return f.geometry.coordinates[0];
  });

  container = document.createElement('div');
  document.body.appendChild(container);

  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    1,
    10000
  );
  // camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 1000000000 );
  camera.position.z = 3000;

  scene = new THREE.Scene();

  // var light = new THREE.AmbientLight( 0x404040 ); // soft white light
  // scene.add( light );

  // White directional light at half intensity shining from the top.
  // var directionalLight = new THREE.PointLight( 0xffffff, 1, 0, 2 );
  // scene.add( directionalLight );
  /************************************************
     THIS EXAMPLE USES GEOMETRY
     ************************************************/
  tin.forEach(function(element) {
    /*****************************************
       * seems to work
       */
    var geometry = new THREE.Geometry();
    geometry.vertices.push(
      new THREE.Vector3(
        element[0][0] - minx,
        element[0][1] - miny,
        element[0][2] - minz
      ),
      new THREE.Vector3(
        element[1][0] - minx,
        element[1][1] - miny,
        element[1][2] - minz
      ),
      new THREE.Vector3(
        element[2][0] - minx,
        element[2][1] - miny,
        element[2][2] - minz
      )
    );
    geometry.faces.push(new THREE.Face3(0, 1, 2));
    geometry.computeBoundingSphere();

    /*********************************************
       * another option?
       */
    // var plane = new THREE.Shape();
    // // origin x,y - adjusted
    // plane.moveTo( element[0][0] - minx, element[0][1] - miny );

    // // lineTo(x,y)
    // plane.lineTo( element[1][0] - minx, element[1][1] - miny );
    // plane.lineTo( element[2][0] - minx, element[2][1] - miny );
    // plane.lineTo( element[0][0] - minx, element[0][1] - miny );
    // var geometry = new THREE.ShapeGeometry( plane );

    /**********************************************
       * Required, do not edit
       */
    // var material = new THREE.MeshBasicMaterial( {color: 0x00ff00, side: THREE.DoubleSide, wireframe: true} );
    var material = new THREE.MeshNormalMaterial({ side: THREE.DoubleSide });

    // var material = new THREE.LineBasicMaterial( {
    //   color: 0xffffff,
    //   linewidth: 1,
    //   linecap: 'round', //ignored by WebGLRenderer
    //   linejoin:  'round' //ignored by WebGLRenderer
    // } );
    // var mesh = new THREE.Mesh( geometry, material );
    var mesh = new THREE.Mesh(geometry);
    scene.add(mesh);
  }, this);

  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);

  // stats = new Stats();
  // container.appendChild( stats.dom );

  document.addEventListener('mousemove', onDocumentMouseMove, false);
  document.addEventListener('touchstart', onDocumentTouchStart, false);
  document.addEventListener('touchmove', onDocumentTouchMove, false);

  //

  window.addEventListener('resize', onWindowResize, false);
}

function onWindowResize() {
  windowHalfX = window.innerWidth / 2;
  windowHalfY = window.innerHeight / 2;

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

//

function onDocumentMouseMove(event) {
  // return;
  mouseX = event.clientX * 5 - windowHalfX;
  mouseY = event.clientY * 5 - windowHalfY;
}

function onDocumentTouchStart(event) {
  if (event.touches.length > 1) {
    event.preventDefault();

    mouseX = event.touches[0].pageX - windowHalfX;
    mouseY = event.touches[0].pageY - windowHalfY;
  }
}

function onDocumentTouchMove(event) {
  if (event.touches.length == 1) {
    event.preventDefault();

    mouseX = event.touches[0].pageX - windowHalfX;
    mouseY = event.touches[0].pageY - windowHalfY;
  }
}

//

function animate() {
  requestAnimationFrame(animate);

  render();
  // stats.update();
}

function render() {
  camera.position.x += (mouseX - camera.position.x) * 0.05;
  camera.position.y += (-mouseY - camera.position.y) * 0.05;
  camera.lookAt(scene.position);

  renderer.render(scene, camera);
}
