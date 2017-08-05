/**
 * A jBinary typeset definition for the las file type.
 * las is the most common way of exchanging Lidar point cloud data.
 * The spec is maintained by the American Society for Photogrammetry & Remote Sensing.
 *
 * This typeset is based on version 1.4 of the spec:
 * http://www.asprs.org/wp-content/uploads/2010/12/LAS_1_4_r13.pdf
 *
 * Unless otherwise specified, the data types are taken directly from the spec
 * The equivalent data types were chosen with the assistance of the following resources:
 * - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures
 * - https://msdn.microsoft.com/en-us/library/s3f49ktz(v=vs.80).aspx
 *
 * Data equivalents used in this typeset definition
 * Spec               | jBinary equivalent    | length
 * ===================|=======================|=======
 * char               | 'char'                | 1 byte
 * char[x]            | ['array', 'char', x]  | x bytes
 * unsigned short     | 'uint16'              | 2 bytes
 * unsigned long      | 'uint32'              | 4 bytes
 * unsigned char      | 'uint8'               | 1 byte
 * double             | 'float64'             | 8 bytes
 * unsigned long long | 'uint64'              |  8 bytes
 * float              | 'float32'             | 4 bytes
 * bit                | ['bitfield' 1]        | 1 bit
 *
 * LAS 1.4 Format Definition
 * - PUBLIC HEADER BLOCK
 * - VARIABLE LENGTH RECORDS (VLR)
 * - POINT DATA RECORDS
 * - EXTENDED VARIABLE LENGTH RECORDS (EVLR)
 *
 * [*] = Optional field
 */

const components = {};

module.exports = {
  'jBinary.all': 'Las',
  'jBinary.littleEndian': true,

  header: {
    // TODO: is there a better way to declare this, e.g. string(4)?
    // fileSignatureLASF is required to be 'LASF'
    fileSignatureLASF: ['array', 'char', 4],
    fileSourceId: 'uint16',
    globalEncoding: 'uint16',
    projectIdGuidData_1: 'uint32',// [*]
    projectIdGuidData_2: 'uint16',// [*]
    projectIdGuidData_3: 'uint16',// [*]
    projectIdGuidData_4: ['array', 'char', 8],// [*]
    versionMajor: 'uint8',
    versionMinor: 'uint8',
    systemIdentifier: ['array', 'char', 32],
    generatingSoftware: ['array', 'char', 32],
    fileCreationDayOfYear: 'uint16',
    fileCreationYear: 'uint16',
    headerSize: 'uint16',
    offsetToPointData: 'uint32',
    numberOfVariableLengthRecords: 'uint32',
    pointDataRecordFormat: 'uint8',
    pointDataRecordLength: 'uint16',
    legacyNumberOfPointRecords: 'uint32',
    legacyNumberOfPointsByReturn: 'uint32',
    xScaleFactor: 'float64',
    zScaleFactor: 'float64',
    yScaleFactor: 'float64',
    xOffset: 'float64',
    yOffset: 'float64',
    zOffset: 'float64',
    maxX: 'float64',
    minX: 'float64',
    maxY: 'float64',
    minY: 'float64',
    maxZ: 'float64',
    minZ: 'float64',
    startOfWaveformDataPacketRecord: 'uint64',
    startOfFirstExtendedVariableLengthRecord: 'uint64',
    numberOfExtendedVariableLengthRecords: 'uint32',
    numberOfPointRecords: 'uint64',
    numberOfPointsByReturn: ['array', 'uint64', 15]
  },

  variableLengthRecordHeader: {
    reserved: 'uint16',// [*]
    userId: ['array', 'char', 16],
    recordId: 'uint16',
    recordLengthAfterHeader: 'uint16',
    description: ['array', 'char', 16]// [*]
  },

  //
  // Define point data formats
  //

  // Partials
  // format 0 and 6 are extended with these partials to build the other formats

  gps: {
    gpsTime: 'float64'
  },

  colors: {
    red: 'uint16',
    green: 'uint16',
    blue: 'uint16'
  },

  wavePacket: {
    wavePacketDescriptorIndex: 'uint8',
    byteOffsetToWaveformData: 'uint64',
    waveformPacketSizeInBytes: 'uint32',
    returnPointWaveformLocation: 'float32',
    x_T: 'float32',
    y_T: 'float32',
    z_T: 'float32'
  },

  // (near infrared)
  NIR: {
    nir: 'uint16'
  },

  // Format 0 serves as the basis for formats 1 - 5
  pointDataRecordFormat0: {
    x: 'int32',
    y: 'int32',
    z: 'int32',
    intensity: 'uint16',// [*]
    returnNumber: ['bitfield', 3],
    numberOfReturnsGivenPulse: ['bitfield', 3],
    scanDirectionFlag: ['bitfield', 1],
    edgeOfFlightLine: ['bitfield', 1],
    classification: 'uint8',
    scanAngleRank_90To_90LeftSide: 'char',
    userData: 'uint8',// [*]
    pointSourceId: 'uint16'
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
    x: 'int32',
    y: 'int32',
    z: 'int32',
    intensity: 'uint16',// [*]
    returnNumber: ['bitfield', 4],
    numberOfReturnsGivenPulse: ['bitfield', 4],
    classificationFlags: ['bitfield', 4],// [*]
    scannerChannel: ['bitfield', 2],
    scanDirectionFlag: ['bitfield', 1],
    edgeOfFlightLine: ['bitfield', 1],
    classification: 'uint8',
    userData: 'uint8',// [*]
    scanAngleRank_90To_90LeftSide: 'char',
    pointSourceId: 'uint16',
    gpsTime: 'float64'
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
    reserved: 'uint16',// [*]
    userId: ['array', 'char', 16],
    recordId: 'uint16',
    recordLengthAfterHeader: 'uint64',
    description: ['array', 'char', 32]// [*]
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
