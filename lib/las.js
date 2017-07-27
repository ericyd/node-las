/**
 * A jBinary typeset definition for the las file type.
 * las is the most common way of exchanging Lidar point cloud data.
 * The spec is maintained by the American Society for Photogrammetry & Remote Sensing.
 *
 * This typeset is based on version 1.4 of the spec:
 * http://www.asprs.org/wp-content/uploads/2010/12/LAS_1_4_r13.pdf
 *
 * Comments after type declarations are notes taken directly from the las spec.
 * Data equivalents take from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures
 * and https://msdn.microsoft.com/en-us/library/s3f49ktz(v=vs.80).aspx
 * Outstanding questions for jDataView:
 * - is 'uint64' the best analog to 'unsigned long long'?
 * - is 'char' or 'uint8' the best analog for 'unsigned char'?
 *
 * [*] = Required field
 */

const components = {};

module.exports = {
  'jBinary.all': 'Las',
  'jBinary.littleEndian': true,

  header: {
    // TODO: is there a better way to declare this, e.g. string(4)?
    // fileSignatureLASF is required to be 'LASF'
    fileSignatureLASF: ['array', 'char', 4], // char[4] - 4 bytes - [*]
    fileSourceId: 'uint16', // unsigned short - 2 bytes - [*]
    globalEncoding: 'uint16', // unsigned short - 2 bytes - [*]
    projectIdGuidData_1: 'uint32', // unsigned long - 4 bytes
    projectIdGuidData_2: 'uint16', // unsigned short - 2 byte
    projectIdGuidData_3: 'uint16', // unsigned short - 2 byte
    projectIdGuidData_4: ['array', 'char', 8], // unsigned char[8] - 8 bytes
    versionMajor: 'uint8', // unsigned char - 1 byte - [*]
    versionMinor: 'uint8', // unsigned char - 1 byte - [*]
    systemIdentifier: ['array', 'char', 32], // char[32] - 32 bytes - [*]
    generatingSoftware: ['array', 'char', 32], // char[32] - 32 bytes - [*]
    fileCreationDayOfYear: 'uint16', // unsigned short - 2 bytes - [*]
    fileCreationYear: 'uint16', // unsigned short - 2 bytes - [*]
    headerSize: 'uint16', // unsigned short - 2 bytes - [*]
    offsetToPointData: 'uint32', // unsigned long - 4 bytes - [*]
    numberOfVariableLengthRecords: 'uint32', // unsigned long - 4 bytes - [*]
    pointDataRecordFormat: 'uint8', // unsigned char - 1 byte - [*]
    pointDataRecordLength: 'uint16', // unsigned short - 2 bytes - [*]
    legacyNumberOfPointRecords: 'uint32', // unsigned long - 4 bytes - [*]
    legacyNumberOfPointsByReturn: 'uint32', // unsigned long [5] - 20 bytes - [*]
    xScaleFactor: 'float64', // double - 8 bytes - [*]
    zScaleFactor: 'float64', // double - 8 bytes - [*]
    yScaleFactor: 'float64', // double - 8 bytes - [*]
    xOffset: 'float64', // double - 8 bytes - [*]
    yOffset: 'float64', // double - 8 bytes - [*]
    zOffset: 'float64', // double - 8 bytes - [*]
    maxX: 'float64', // double - 8 bytes - [*]
    minX: 'float64', // double - 8 bytes - [*]
    maxY: 'float64', // double - 8 bytes - [*]
    minY: 'float64', // double - 8 bytes - [*]
    maxZ: 'float64', // double - 8 bytes - [*]
    minZ: 'float64', // double - 8 bytes - [*]
    startOfWaveformDataPacketRecord: 'uint64', // Unsigned long long - 8 bytes - [*]
    startOfFirstExtendedVariableLengthRecord: 'uint64', // unsigned long long - 8 bytes - [*]
    numberOfExtendedVariableLengthRecords: 'uint32', // unsigned long - 4 bytes - [*]
    numberOfPointRecords: 'uint64', // unsigned long long - 8 bytes - [*]
    numberOfPointsByReturn: ['array', 'uint64', 15] // unsigned long long [15] - 120 bytes - [*]
  },

  variableLengthRecordHeader: {
    reserved: 'uint16', // unsigned short - 2 bytes
    userId: ['array', 'char', 16], // char[16] - 16 bytes - [*]
    recordId: 'uint16', // unsigned short - 2 bytes - [*]
    recordLengthAfterHeader: 'uint16', // unsigned short - 2 bytes - [*]
    description: ['array', 'char', 16] // char[32] - 32 bytes
  },

  //
  // Define point data formats
  //

  // Partials
  // format 0 and 6 are extended with these partials to build the other formats

  gps: {
    gpsTime: 'float64' // double - 8 bytes - [*]
  },

  colors: {
    red: 'uint16', // unsigned short - 2 bytes - [*]
    green: 'uint16', // unsigned short - 2 bytes - [*]
    blue: 'uint16' // unsigned short - 2 bytes - [*]
  },

  wavePacket: {
    wavePacketDescriptorIndex: 'uint8', // unsigned char - 1 byte
    byteOffsetToWaveformData: 'uint64', // unsigned long long - 8 bytes
    waveformPacketSizeInBytes: 'uint32', // unsigned long - 4 bytes
    returnPointWaveformLocation: 'float32', // float - 4 bytes
    x_T: 'float32', // float - 4 bytes
    y_T: 'float32', // float - 4 bytes
    z_T: 'float32' // float - 4 bytes
  },

  // (near infrared)
  NIR: {
    nir: 'uint16' // unsigned short - 2 bytes - [*]
  },

  // Format 0 serves as the basis for formats 1 - 5
  pointDataRecordFormat0: {
    x: 'int32', // long - 4 bytes - [*]
    y: 'int32', // long - 4 bytes - [*]
    z: 'int32', // long - 4 bytes - [*]
    intensity: 'uint16', // unsigned short - 2 bytes
    // returnNumber: , // 3 bits (bits 0 – 2) - 3 bits - [*]
    // numberOfReturnsGivenPulse: , // 3 bits (bits 3 – 5) - 3 bits - [*]
    // scanDirectionFlag: , // 1 bit (bit 6) - 1 bit - [*]
    // edgeOfFlightLine: , // 1 bit (bit 7) - 1 bit - [*]
    comboRecords: 'uint8', // <-- this is a combo of the above 4 fields, probably can split somehow
    classification: 'uint8', // unsigned char - 1 byte - [*]
    scanAngleRank_90To_90LeftSide: 'char', // char - 1 byte - [*]
    userData: 'uint8', // unsigned char - 1 byte
    pointSourceId: 'uint16' // unsigned short - 2 bytes - [*]
  },

  // Format 6 serves as the basis for formats 6 - 10
  //
  // From the spec:
  // Point Data Record Format 6 contains the core 30 bytes that are shared by
  // Point Data Record Formats 6 to 10. The difference to the core 20 bytes of
  // Point Data Record Formats 0 to 5 is that there are more bits for return numbers
  // in order to support up to 15 returns, there are more bits for point classifications
  // to support up to 256 classes, there is a higher precision scan angle (16 bits instead of 8),
  // and the GPS time is mandatory.

  // format 6:
  pointDataRecordFormat6: {
    x: 'int32', // long - 4 bytes - [*]
    y: 'int32', // long - 4 bytes - [*]
    z: 'int32', // long - 4 bytes - [*]
    intensity: 'uint16', // unsigned short - 2 bytes
    // returnNumber: , // 4 bits (bits 0 – 3) - 4 bits - [*]
    // numberOfReturnsGivenPulse: , // 4 bits (bits 4 – 7) - 4 bits - [*]
    // classificationFlags: , // 4 bits (bits 0 - 3)
    // scannerChannel: , // 2 bits (bist 4 - 5) - [*]
    // scanDirectionFlag: , // 1 bit (bit 6) - 1 bit - [*]
    // edgeOfFlightLine: , // 1 bit (bit 7) - 1 bit - [*]
    comboRecords: 'uint16', // <-- this is a combo of the above 6 fields, needs to be split
    classification: 'uint8', // unsigned char - 1 byte - [*]
    userData: 'uint8', // unsigned char - 1 byte
    scanAngleRank_90To_90LeftSide: 'char', // char - 1 byte - [*]
    pointSourceId: 'uint16', // unsigned short - 2 bytes - [*]
    gpsTime: 'float64' // double - 8 bytes - [*]
  },

  // format 1: format0 + the gpsTime field
  pointDataRecordFormat1: ['extend', 'pointDataRecordFormat0', 'gps'],

  // format 2: format0 + 3 color fields
  pointDataRecordFormat2: ['extend', 'pointDataRecordFormat0', 'colors'],

  // format 3: format0 + gps + colors
  pointDataRecordFormat3: ['extend', 'pointDataRecordFormat0', 'gps', 'colors'],

  // format 4: format 1 plus Wave Packets
  pointDataRecordFormat4: ['extend', 'pointDataRecordFormat1', 'wavePacket'],

  // format 5: format 3 plus Wave Packets (see format 4)
  pointDataRecordFormat5: ['extend', 'pointDataRecordFormat3', 'wavePacket'],

  // format 7: format 6 + colors
  pointDataRecordFormat7: ['extend', 'pointDataRecordFormat6', 'colors'],

  // format 8: format 7 + NIR
  pointDataRecordFormat8: ['extend', 'pointDataRecordFormat7', 'NIR'],

  // format 9: format 6 + wave packet
  pointDataRecordFormat9: ['extend', 'pointDataRecordFormat6', 'wavePacket'],

  // format 10: format 7 + wave packet
  pointDataRecordFormat10: ['extend', 'pointDataRecordFormat7', 'wavePacket'],

  extendedVariableLengthRecordsHeader: {
    reserved: 'uint16', // unsigned short - 2 bytes
    userId: ['array', 'char', 16], // char[16] - 16 bytes - [*]
    recordId: 'uint16', // unsigned short - 2 bytes - [*]
    recordLengthAfterHeader: 'uint64', // unsigned long long - 8 bytes - [*]
    description: ['array', 'char', 32] // char[32] - 32 bytes
  },

  points: ['array', 'pointDataRecordFormat', 'header.pointDataRecordLength'],

  // variable length records
  vlrs: [
    'array',
    'variableLengthRecordHeader',
    'header.numberOfVariableLengthRecords'
  ],

  Las: [
    'extend',
    components.header,
    // components.variableLengthRecordHeader,
    // components.pointDataRecordFormat,
    // components.extendedVariableLengthRecordsHeader
    points,
    vlrs
  ]
};
