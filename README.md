# Node LAS<sup style="color:red">beta</sup>
LAS toolkit for working with Lidar data in Node

This is very much a work in progress.
The long-term goal is to create a [libLAS] or [LAStools] -esque toolkit written entirely in Javascript.
Thanks to the folks who built [jBinary], this may not be an impossible goal.




## Project status

This was kind of abandoned after I found that there are already some excellent LAS/LAZ viewers online (<http://potree.org/>, <http://plas.io/>). I couldn't really think of a reason to continue developing this into a more robust tool when browser visualization is probably the best reason for JavaScript LAS implementation anyway.

However, a lot of groundwork has been laid here so feel free to fork or collaborate if this project seems interesting to you.

A note of caution: LAS uses a lot of `double` values in its binary encoding, which JavaScript does not handle elegantly. More investigation needed into how to accurately parse those values and use them to read/write values.




## Contents

* [Usage](#usage)
* [API](#api)
  * read
  * filter
  * sample
  * write
  * toGeoJSON
  * toJSON
  * toTXT
* [JSON structure](#json-structure)




## Usage

Node-las requires data to be added with one of the following methods:
* `read`
* `load` (not yet implemented)

Data can then be manipulated with one of the following methods:
* `filter`
* `sample` (not yet implemented)

Finally data can be output with one of the following methods:
* `write`
* `toJSON`
* `toTXT`




## API

### read(path)

* path `<string>`: filename to read data from

Reads a file designated by `path`.  `read` will almost never need to be called by itself;
instead you will call it with other modifiers (`filter`, `sample`) or output (`write`, `toJSON`, `toTXT`)
methods that will allow you to work with the data.

`read` returns a `Task` containing the binary instance of the file.

#### Example

```js
// create a copy of a LAS file
const las = require('node-las');

las.read('sample.las').write('sample-copy.las');
```




### filter(options)

* options `<object>`

`options` declares the parameters by which the point data should be filtered.
The keys should correspond to keys in the point data objects, and the values
are comparison functions (with a unique form). If a point fails to satisfy any of the
requirements declared in `options`, it will be removed from the filtered data set.

The comparison functions are declared as arrays, where the first item in the array
is a string which defines the function to use.  The subsequent items in the array are the
arguments for that function.

Valid comparison strings include:
* `lt` | `lessThan` | `less than` for a "less than" comparison
* `gt` | `greaterThan` | `greater than` for a "greater than" comparison
* `eq` | `equal` | `equals` for an "equal to" comparison
* `between` for an exclusive between comparison

Any of the aliases listed above are valid. That is, `lt` and `less than` will return the same result.

#### Examples

```js
// remove all points below 10000 elevation
const las = require('las');

las.read('sample.las')
  .filter({
    z: ['lt', 10000]
  })
  .write('filtered.las')
```

```js
// select all points between two longitudes
const las = require('las');

las.read('sample.las')
  .filter({
    x: ['between', -127, -130]
  })
  .write('filtered.las')
```




### sample(n)

* n `<number>`

Takes every `n` points, resulting in a points array that is 1/n the size of the original points array.
For example, if your point cloud had 9000 points and you used `sample(9)`,
the resulting point cloud would contain 1000 points.

Note that this function does a very unsophisticated sampling.
To be more selective about which points to exclude, please consider using `filter`.

```js
// Reduce the point count by a third
const las = require('las');

las.read('sample.las')
  .toJSON()
  .then(data => console.log(data.points.length)) // 300

las.read('sample.las')
  .sample(3)
  .toJSON()
  .then(data => console.log(data.points.length)) // 100
```




### write(path[, options])

* path `<string>`: filename to write data to
* options `<object>`
    * returnJSON `<boolean>` **Default**: false. If true, the promise returned by `write`
    will resolve with the JSON data structure of the LAS file.
    If false, the promise will resolve with no data.

Returns a `Promise` after the file has been successfully written.
Note that the resolved Promise does not contain any data.

#### Example

```js
// create a copy of a LAS file
const las = require('node-las');

las.read('sample.las').write('sample-copy.las');
```



### toGeoJSON()

Returns a Promise that resolves with a GeoJSON `FeatureCollection<points>` object.
Each Feature in the FeatureCollection contains the full properties of the LAS Point
in the `properties` member.

Useful for using with other libraries like [TurfJS](http://turfjs.org/) or any other
application where GeoJSON is required.

See the GeoJSON spec ([text](https://tools.ietf.org/rfc/rfc7946.txt) or [PDF](https://tools.ietf.org/pdf/rfc7946.pdf)) for more details.

```js
// view a JSON representation of the data
const las = require('node-las');
const turf = require('@turf/turf');

las.read('sample.las')
  .toGeoJSON()
  .then(geojson => {
    turf.tin(geojson) // now we have a TIN of our points - woo!
  });
```




### toJSON()

Returns a `Promise` where the resolved data is a JSON representation of the LAS file data.
See [JSON structure](#json-structure) for more information on the internal structure of the JSON object returned.

#### Examples

```js
// view a JSON representation of the data
const las = require('node-las');

las.read('sample.las')
  .toJSON()
  .then(data => {
    console.log(Object.keys(data)) // <= ['header', 'VLRs', 'points', 'EVLRs']
  });
```

```js
// Write the JSON data to a file
const las = require('node-las');
const fs = require('fs');

las
  .read('sample.las')
  .toJSON()
  .then(data => {
    fs.writeFileSync('sample-json.json', JSON.stringify(data))
  });
```




### toTXT([columns])

* columns `<[string]>` **Default**: `['x', 'y', 'z']`

Returns a `Promise` where the resolved data is a block of text in comma-delimited text format.
The first line of the text is the header row which will match the passed `columns` parameter
or the default `x,y,z`. The subsequent lines are the selected properties from the LAS file's
point data.

This method can be useful if you want to create a customized ASCII representation of the LAS file.

#### Examples

```js
// Write the text data to a file
const las = require('node-las');
const fs = require('fs');

las
  .read('sample.las')
  .toTXT()
  .then(data => {
    fs.writeFileSync('sample-json.json', data)
  });
```

```js
// Customize the returned columns
const las = require('node-las');
const fs = require('fs');

las
  .read('sample.las')
  .toTXT(['x','returnNumber','intensity','y'])
  .then(data => {
    console.log(data);
    // First row is header, followed by data
    //
    // x,returnNumber,intensity,y
    // 4246424,2,45,235626
    // 4259484,1,97,145029
    // ...
  });
```




## JSON Structure

When manipulating the data manually using the `toJSON` method, node-las will return a JSON object with 4 keys, each of which contain sections of data from the binary LAS file.  Below is a detailed schematic of the structure:

```js
{
  // Typically will not need to modify these values directly,
  // but listing here for completeness
  header: {
    signature: 'LASF',
    fileSourceId: Number,
    globalEncoding: Number,
    projectIdGuidData_1: Number,
    projectIdGuidData_2: Number,
    projectIdGuidData_3: Number,
    projectIdGuidData_4: [Number],
    versionMajor: Number,
    versionMinor: Number,
    systemIdentifier: String,
    generatingSoftware: String,
    fileCreationDayOfYear: Number,
    fileCreationYear: Number,
    headerSize: Number,
    offsetToPoints: Number,
    numberOfVLRs: Number,
    pointFormat: Number,
    pointsLength: Number,
    legacyNumberOfPoints: Number,
    legacyNumberOfPointsByReturn: Number,
    xScaleFactor: Number,
    zScaleFactor: Number,
    yScaleFactor: Number,
    xOffset: Number,
    yOffset: Number,
    zOffset: Number,
    maxX: Number,
    minX: Number,
    maxY: Number,
    minY: Number,
    maxZ: Number,
    minZ: Number,
    startOfWaveformData: Number,
    startOfEVLRs: Number,
    numberOfEVLRs: Number,
    numberOfPoints: Number,
    numberOfPointsByReturn: [Number]
  },
  // variable length records
  VLRs: [
    {
      signature: Number,
      userId: String,
      id: Number,
      lengthAfterHeader: Number,
      description: String,
      data: String
    }
    ...
  ],
  // Depending on the point format used in the LAS file,
  // the objects in the points array will contain different values.
  // These are all the possible values that can be found in a Point object.
  points: [
    {
      // these will be present in all point formats
      x: Number,
      y: Number,
      z: Number,
      intensity: Number,
      returnNumber: ['bitfield', 3],
      numberOfReturnsGivenPulse: ['bitfield', 3],
      scanDirectionFlag: ['bitfield', 1],
      edgeOfFlightLine: ['bitfield', 1],
      classification: Number,
      scanAngleRank_90To_90LeftSide: Number,
      userData: Number,
      pointSourceId: Number,
      // optional fields start here
      gpsTime: Number,
      red: Number,
      green: Number,
      blue: Number,
      wavePacketDescriptorIndex: Number,
      byteOffsetToWaveformData: Number,
      waveformPacketSizeInBytes: Number,
      returnPointWaveformLocation: Number,
      x_T: Number,
      y_T: Number,
      z_T: Number,
      NIR: Number
    }
    ...
  ],
  EVLRs: [
    {
      userId: String,
      id: Number,
      lengthAfterHeader: Number,
      description: String,
      data: String
    }
    ...
  ]
}
```

## Roadmap (not necessarily in order):
* ensure interoperability with all LAS file versions and point data formats
* Add read and write methods for `.las` files
* Add read and write methods for `.laz` files
* Add filter method for point data
* Add write support for text (ASCII) and JSON file formats
* Add sampling method(s) for point data

<!-- References -->

[libLAS]: https://www.liblas.org/
[LAStools]: https://github.com/LAStools/LAStools
[jBinary]: https://github.com/jDataView/jBinary
