# node-las<sup style="color:red">beta</sup>
LAS toolkit for working with Lidar data in Node

This is very much a work in progress.
The long-term goal is to create a [libLAS] or [LAStools] -esque toolkit written entirely in Javascript.
Thanks to the folks who built [jBinary], this may not be an impossible goal.

The work on this is being done in the dev branch. The master will be updated when there is 
a usable version of the program.

Roadmap (not necessarily in order):
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
