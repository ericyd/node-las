/**
 * A jBinary typeset definition for the LAS file type.
 * LAS is the most common way of exchanging LIDAR point cloud data.
 * The spec is maintained by the American Society for Photogrammetry & Remote Sensing.
 *
 * This typeset is based on version 1.4 of the LAS file spec.
 * Many of the comments and annotations in this typeset are taken directly from the spec:
 * http://www.asprs.org/wp-content/uploads/2010/12/LAS_1_4_r13.pdf
 * All other versions listed here:
 * https://www.asprs.org/committee-general/laser-las-file-format-exchange-activities.html
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
 * char[x]            | ['string', x]         | x bytes
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
 * Any field in the Public Header Block that is not required and
 * is not used must be zero filled.
 */

const jBinary = require('jbinary');
const R = require('ramda');

module.exports = {
  'jBinary.all': 'LAS',
  'jBinary.littleEndian': true,

  // Public Header block
  //===============================
  header: {
    // the last parameter is "strictmode".
    // when true, it will throw an error if the signature isn't "LASF"
    signature: ['const', ['string', 4], 'LASF', true],
    fileSourceId: 'uint16',
    globalEncoding: 'uint16',
    projectIdGuidData_1: 'uint32', // [*]
    projectIdGuidData_2: 'uint16', // [*]
    projectIdGuidData_3: 'uint16', // [*]
    projectIdGuidData_4: ['array', 'uint8', 8], // [*]
    versionMajor: 'uint8',
    versionMinor: 'uint8',
    systemIdentifier: ['string', 32],
    generatingSoftware: ['string', 32],
    fileCreationDayOfYear: 'uint16',
    fileCreationYear: 'uint16',
    // For LAS 1.4 the headerSize is 375 bytes
    headerSize: 'uint16',
    // The number of bytes from beginning of file first field of the first point record data
    offsetToPoints: 'uint32',
    // The number of VLRs that are stored in the file preceding the Point Data Records
    numberOfVLRs: 'uint32',
    // LAS 1.4 defines types 0 through 10 for point data formats
    pointFormat: 'uint8',
    // The size, in bytes, of the Point Data Record. All Point Data Records
    // within a single LAS file must be the same type and hence the same length.
    // If the specified size is larger than implied by the point format type
    // (e.g. 32 bytes instead of 28 bytes for type 1) the remaining bytes are user-specific
    // "extra bytes". The format and meaning of such “extra bytes” can (optionally) be
    // described with an Extra Bytes VLR (see Table 24 and Table 25)
    pointsLength: 'uint16',
    // total number of point records if the file is maintaining legacy compatibility
    // and the number of points is no greater than UINT32_MAX. It must be zero otherwise.
    legacyNumberOfPoints: 'uint32',
    legacyNumberOfPointsByReturn: 'uint32',
    // The corresponding X, Y, and Z scale factor must be multiplied by the X, Y, or Z
    // point record value to get the actual X, Y, or Z coordinate
    xScaleFactor: 'float64',
    zScaleFactor: 'float64',
    yScaleFactor: 'float64',
    // To scale a given X from the point record, take the point record X
    // multiplied by the X scale factor, and then add the X offset.
    // X coordinate = (X record * X scale ) + X offset
    // Y coordinate = (Y record * Y scale ) + Y offset
    // Z coordinate = (Z record * Z scale ) + Z offset
    xOffset: 'float64',
    yOffset: 'float64',
    zOffset: 'float64',
    // the actual unscaled extents of the LAS point file data
    maxX: 'float64',
    minX: 'float64',
    maxY: 'float64',
    minY: 'float64',
    maxZ: 'float64',
    minZ: 'float64',
    // This will be the first byte of the Waveform Data Packet header
    startOfWaveformData: 'uint64',
    // Length from beginning of the LAS file to the first byte of the first EVLR
    startOfEVLRs: 'uint64',
    // This field contains the current number of EVLRs (including, if present,
    // the Waveform Data Packet Record) that are stored in the file after the Point Data Records
    numberOfEVLRs: 'uint32',
    // total number of point records in the file
    numberOfPoints: 'uint64',
    numberOfPointsByReturn: ['array', 'uint64', 15]
  },

  // Define point data formats
  //==========================

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
  pointFormat0: {
    x: 'int32',
    y: 'int32',
    z: 'int32',
    intensity: 'uint16', // [*]
    returnNumber: ['bitfield', 3],
    numberOfReturnsGivenPulse: ['bitfield', 3],
    scanDirectionFlag: ['bitfield', 1],
    edgeOfFlightLine: ['bitfield', 1],
    classification: 'uint8',
    scanAngleRank_90To_90LeftSide: 'uint8', // this is an unsigned char in v1.0 but a char in v1.3
    userData: 'uint8', // [*]
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
  pointFormat6: {
    x: 'int32',
    y: 'int32',
    z: 'int32',
    intensity: 'uint16', // [*]
    returnNumber: ['bitfield', 4],
    numberOfReturnsGivenPulse: ['bitfield', 4],
    classificationFlags: ['bitfield', 4], // [*]
    scannerChannel: ['bitfield', 2],
    scanDirectionFlag: ['bitfield', 1],
    edgeOfFlightLine: ['bitfield', 1],
    classification: 'uint8',
    userData: 'uint8', // [*]
    scanAngleRank_90To_90LeftSide: 'char',
    pointSourceId: 'uint16',
    gpsTime: 'float64'
  },

  // format 1: format0 + the gpsTime field
  pointFormat1: ['extend', 'pointFormat0', 'gps'],

  // format 2: format0 + 3 color fields
  pointFormat2: ['extend', 'pointFormat0', 'colors'],

  // format 3: format0 + gps + colors
  pointFormat3: ['extend', 'pointFormat0', 'gps', 'colors'],

  // format 4: format 1 plus Wave Packets
  pointFormat4: ['extend', 'pointFormat1', 'wavePacket'],

  // format 5: format 3 plus Wave Packets (see format 4)
  pointFormat5: ['extend', 'pointFormat3', 'wavePacket'],

  // format 7: format 6 + colors
  pointFormat7: ['extend', 'pointFormat6', 'colors'],

  // format 8: format 7 + NIR
  pointFormat8: ['extend', 'pointFormat7', 'NIR'],

  // format 9: format 6 + wave packet
  pointFormat9: ['extend', 'pointFormat6', 'wavePacket'],

  // format 10: format 7 + wave packet
  pointFormat10: ['extend', 'pointFormat7', 'wavePacket'],

  // (Extended) Variable Length Record headers
  //==========================================
  // These define the length and structure of the variable length and
  // extended variable length records.
  // The "lengthAfterHeader" is the length of the string after the header section.
  // Each record contains a header and data after the header
  vlrHeader: {
    signature: 'uint16', // required in las 1.0, optional in las 1.4
    userId: ['string', 16],
    id: 'uint16',
    lengthAfterHeader: 'uint16',
    description: ['string', 32] // [*]
  },

  evlrHeader: {
    signature: ['skip', 2], // [*]
    userId: ['string', 16],
    id: 'uint16',
    lengthAfterHeader: 'uint64',
    description: ['string', 32] // [*]
  },

  LAS: [
    'object',
    {
      header: 'header',

      // Variable Length Records
      //========================
      // The Public Header Block can be followed by any number of Variable Length Records (VLRs),
      // as specified in the header.
      // Variable Length Records must be accessed sequentially since the size of each variable length
      // record is contained in the Variable Length Record Header.
      VLRs: jBinary.Type({
        read: function(file) {
          // Basic description of what is happening:
          // 1. go to the position defined as the end of the header, where the VLRs begin
          // 2. grab the vlrHeader type definition
          // 3. loop through the number of VLRs that are defined in the public header
          // 4. read the VLR header, get the value for the length of the data
          // 5. read that length of data and append it to the header for the entire VLR object
          return this.binary.seek(file.header.headerSize, function() {
            const vlrHeaderType = this.getType('vlrHeader');
            const records = [];
            for (i = 0; i < file.header.numberOfVariableLengthRecords; i++) {
              const vlrHeaderValues = this.read(vlrHeaderType);
              const VLR = ['string', vlrHeaderValues.lengthAfterHeader];
              const record = this.read(VLR);
              records.push(Object.assign(vlrHeaderValues, { data: record }));
            }
            return records;
          });
        },
        write: function(values, file) {
          return this.binary.seek(file.header.headerSize, function() {
            values.forEach(vlr => {
              const vlrHeaderType = this.getType('vlrHeader');
              const vlrHeaderValues = R.dissoc('data', vlr);
              const vlrDataType = ['string', vlrHeaderValues.lengthAfterHeader];
              const vlrData = R.prop('data', vlr);
              this.write(vlrHeaderType, vlrHeaderValues);
              this.write(vlrDataType, vlrData);
            });
          });
        }
      }),

      // Point Data records
      //===================
      points: jBinary.Type({
        read: function(file) {
          return this.binary.seek(file.header.offsetToPoints, function() {
            const pointDataType = this.getType(
              `pointFormat${file.header.pointFormat}`
            );
            const records = [];
            const numberOfPoints =
              file.header.versionMinor < 4
                ? file.header.legacyNumberOfPoints
                : file.header.numberOfPoints;
            for (i = 0; i < numberOfPoints; i++) {
              const pointData = this.read(pointDataType);
              records.push(pointData);
            }
            return records;
          });
        },
        write: function(values, file) {
          return this.binary.seek(file.header.offsetToPoints, function() {
            const pointDataType = this.getType(
              `pointFormat${file.header.pointFormat}`
            );
            this.write(['array', pointDataType], values);
          });
        }
      }),

      // Extended Variable Length Records
      //=================================
      EVLRs: jBinary.Type({
        read: function(file) {
          // version 0 doesn't have ELVRs
          if (file.header.versionMinor < 4) {
            return null;
          }
          // TODO: figure out why startOfEVLRs.valueOf() is significantly larger than the size of the binary
          // currently, have to skip this for any files that are version 1.4 because this is throwing errors
          return null;

          return this.binary.seek(
            file.header.startOfEVLRs.valueOf(),
            function() {
              const evlrHeader = this.getType('evlrHeader');
              const records = [];
              for (i = 0; i < file.header.numberOfEVLRs; i++) {
                const evlrHeaderValues = this.read(evlrHeader);
                const EVLR = ['string', evlrHeaderValues.lengthAfterHeader];
                const record = this.read(EVLR);
                records.push(Object.assign(evlrHeaderValues, { data: record }));
              }
              return records;
            }
          );
        },
        write: function(values, file) {
          if (file.header.versionMinor < 4) {
            return null;
          }
          values.forEach(evlr => {
            const evlrHeaderType = this.getType('evlrHeader');
            const evlrHeaderValues = R.dissoc('data', evlr);
            const evlrDataType = ['string', evlrHeaderValues.lengthAfterHeader];
            const evlrData = R.prop('data', evlr);
            this.binary.write(evlrHeader, evlrHeaderValues);
            this.binary.write(evlrDataType, evlrData);
          });
        }
      })
    }
  ],

  // manual calculation of size of blocks, in bytes
  // TODO: can this be dynamic?
  sizes: {
    pointFormat0: 20,
    pointFormat1: 28,
    pointFormat2: 26,
    pointFormat3: 34,
    pointFormat4: 57,
    pointFormat5: 63,
    pointFormat6: 29,
    pointFormat7: 35,
    pointFormat8: 37,
    pointFormat9: 64,
    pointFormat10: 66,
    vlrHeader: 54,
    evlrHeader: 60
  }
};
