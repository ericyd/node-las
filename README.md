# node-las<sup style="color:red">beta</sup>
LAS toolkit for working with Lidar data in Node

This is very much a work in progress.
The long-term goal is to create a [libLAS] or [LAStools] -esque toolkit written entirely in Javascript.
Thanks to the folks who built [jBinary], this may not be an impossible goal.

The work on this is being done in the dev branch. The master will be updated when there is 
a usable version of the program.

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

#### Examples

```js
// view a JSON representation of the data
const las = require('node-las');

las.read('sample.las').toJSON().then(data => console.log(data));
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
