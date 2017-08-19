# node-las<sup style="color:red">beta</sup>
LAS toolkit for working with Lidar data in Node

This is very much a work in progress.
The long-term goal is to create a [libLAS] or [LAStools] -esque toolkit written entirely in Javascript.
Thanks to the folks who built [jBinary], this may not be an impossible goal.

The work on this is being done in the dev branch. The master will be updated when there is 
a usable version of the program.

## Contents

* [Usage](#usage)
* [API](#api)
  * read
  * filter
  * toJSON
  * write
* [JSON structure](#json-structure)

## Usage

Node-las requires data to be added with one of the following methods:
* `read`
* `load` (not yet implemented)

Data can then be manipulated with one of the following methods:
* `filter` (not yet implemented)
* `sample` (not yet implemented)

Finally data can be output with one of the following methods:
* `write`
* `toJSON`
* `toTXT` (not yet implemented)

## API

### read(path)

* path `string`: filename to read data from

Returns as `Task` containing the binary instance of the file.
The returned `Task` should not be used directly, but instead
chained with one of the data manipulation (filter, sample) or
data output (write, toJSON, toTXT) methods.

#### Example

```js
// create a copy of a LAS file
const las = require('node-las');

las.read('sample.las').write('sample-copy.las');
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

### write(path)

* path `string`: filename to write data to

Returns a `Promise` after the file has been successfully written.
Note that the resolved Promise does not contain any data.

#### Example

```js
// create a copy of a LAS file
const las = require('node-las');

las.read('sample.las').write('sample-copy.las');
```

## JSON Structure

When manipulating the data manually using the `toJSON` method, node-las will return a JSON object with 4 keys, each of which contain sections of data from the binary LAS file.  Below is a detailed schematic of the structure:

```js
{
  header: {
    signature: 'LASF', // Must equal LASF
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
    // For LAS 1.4 the headerSize is 375 bytes
    headerSize: Number,
    // The number of bytes from beginning of file first field of the first point record data
    offsetToPoints: Number,
    // The number of VLRs that are stored in the file preceding the Point Data Records
    numberOfVLRs: Number,
    // LAS 1.4 defines types 0 through 10 for point data formats
    pointFormat: Number,
    // The size, in bytes, of the Point Data Record. All Point Data Records
    // within a single LAS file must be the same type and hence the same length.
    // If the specified size is larger than implied by the point format type
    // (e.g. 32 bytes instead of 28 bytes for type 1) the remaining bytes are user-specific
    // "extra bytes". The format and meaning of such “extra bytes” can (optionally) be
    // described with an Extra Bytes VLR (see Table 24 and Table 25)
    pointsLength: Number,
    // total number of point records if the file is maintaining legacy compatibility
    // and the number of points is no greater than UINT32_MAX. It must be zero otherwise.
    legacyNumberOfPoints: Number,
    legacyNumberOfPointsByReturn: Number,
    // The corresponding X, Y, and Z scale factor must be multiplied by the X, Y, or Z
    // point record value to get the actual X, Y, or Z coordinate
    xScaleFactor: Number,
    zScaleFactor: Number,
    yScaleFactor: Number,
    // To scale a given X from the point record, take the point record X
    // multiplied by the X scale factor, and then add the X offset.
    // X coordinate = (X record * X scale ) + X offset
    // Y coordinate = (Y record * Y scale ) + Y offset
    // Z coordinate = (Z record * Z scale ) + Z offset
    xOffset: Number,
    yOffset: Number,
    zOffset: Number,
    // the actual unscaled extents of the LAS point file data
    maxX: Number,
    minX: Number,
    maxY: Number,
    minY: Number,
    maxZ: Number,
    minZ: Number,
    // This will be the first byte of the Waveform Data Packet header
    startOfWaveformData: Number,
    // Length from beginning of the LAS file to the first byte of the first EVLR
    startOfEVLRs: Number,
    // This field contains the current number of EVLRs (including, if present,
    // the Waveform Data Packet Record) that are stored in the file after the Point Data Records
    numberOfEVLRs: Number,
    // total number of point records in the file
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
