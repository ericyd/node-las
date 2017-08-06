/**
 * A jBinary typeset definition for the LAS file type.
 * LAS is the most common way of exchanging LIDAR point cloud data.
 * The spec is maintained by the American Society for Photogrammetry & Remote Sensing.
 *
 * This typeset is based on version 1.4 of the LAS file spec.
 * Many of the comments and annotations in this typeset are taken directly from the spec:
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
const jDataView = require('jdataview');

module.exports = {
  'jBinary.all': 'LAS',
  'jBinary.littleEndian': true,

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
  pointDataRecordFormat0: {
    x: 'int32',
    y: 'int32',
    z: 'int32',
    intensity: 'uint16', // [*]
    returnNumber: ['bitfield', 3],
    numberOfReturnsGivenPulse: ['bitfield', 3],
    scanDirectionFlag: ['bitfield', 1],
    edgeOfFlightLine: ['bitfield', 1],
    classification: 'uint8',
    scanAngleRank_90To_90LeftSide: 'char',
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
  pointDataRecordFormat6: {
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

  // use a jBinary template because the length will be determined by the header value
  pointDataTemplate: jBinary.Template({
    setParams: function(header) {
      if (
        header.pointDataRecordFormat > 10 ||
        header.pointDataRecordFormat < 0 ||
        header.pointDataRecordFormat === null ||
        header.pointDataRecordFormat === undefined
      ) {
        throw new TypeError('Could not determine point data record format');
      }
      var itemType = 'pointDataRecordFormat' + header.pointDataRecordFormat;

      this.baseType = {
        length: header.numberOfPointRecords,
        values: ['array', itemType, 'length']
      };
    },
    read: function() {
      return this.baseRead().values;
    },
    write: function(values) {
      this.baseWrite({
        length: values.length,
        values: values
      });
    }
  }),

  // Variable Length Record templates
  //=================================
  // These define the length and structure of the variable length and
  // extended variable length records.
  // Their length is determined by header data, thus the Template format which can access other properties
  variableLengthRecordTemplate: jBinary.Template({
    setParams: function(header) {
      console.log(header)
      var itemType = header.vlrRecordLengthAfterHeader;
      this.baseType = {
        length: header.numberOfVariableLengthRecords,
        values: ['array', itemType, 'length']
      };
    },
    read: function() {
      return this.baseRead().values;
    },
    write: function(values) {
      this.baseWrite({
        length: values.length,
        values: values
      });
    }
  }),

  extendedVariableLengthRecordTemplate: jBinary.Template({
    setParams: function(header) {
      // length/data type is defined in the EVLR header block, recordLengthAfterHeader
      // but it isn't the same datatype - it will be as long as is specified by that value
      // actually, I may be mis-interpretting this.  It's possible that the recordLengthAfterHeader
      // defined the total length of the block of EVLRs, rather than the length of each EVLR
      var itemType = 'uint64';
      this.baseType = {
        length: header.numberOfExtendedVariableLengthRecords,
        values: ['array', itemType, 'length']
      };
    },
    read: function() {
      return this.baseRead().values;
    },
    write: function(values) {
      this.baseWrite({
        length: values.length,
        values: values
      });
    }
  }),

  LAS: [
    'object',
    {
      // Public Header block
      //===============================
      // fileSignatureLASF is required to be 'LASF'
      fileSignatureLASF: ['string', 4],
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
      offsetToPointData: 'uint32',
      // The number of VLRs that are stored in the file preceding the Point Data Records
      numberOfVariableLengthRecords: 'uint32',
      // LAS 1.4 defines types 0 through 10 for point data formats
      pointDataRecordFormat: 'uint8',
      // The size, in bytes, of the Point Data Record. All Point Data Records
      // within a single LAS file must be the same type and hence the same length.
      // If the specified size is larger than implied by the point format type
      // (e.g. 32 bytes instead of 28 bytes for type 1) the remaining bytes are user-specific
      // "extra bytes". The format and meaning of such “extra bytes” can (optionally) be
      // described with an Extra Bytes VLR (see Table 24 and Table 25)
      pointDataRecordLength: 'uint16',
      // total number of point records if the file is maintaining legacy compatibility
      // and the number of points is no greater than UINT32_MAX. It must be zero otherwise.
      legacyNumberOfPointRecords: 'uint32',
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
      startOfWaveformDataPacketRecord: 'uint64',
      // Length from beginning of the LAS file to the first byte of the first EVLR
      startOfFirstExtendedVariableLengthRecord: 'uint64',
      // This field contains the current number of EVLRs (including, if present,
      // the Waveform Data Packet Record) that are stored in the file after the Point Data Records
      numberOfExtendedVariableLengthRecords: 'uint32',
      // total number of point records in the file
      numberOfPointRecords: 'uint64',
      numberOfPointsByReturn: ['array', 'uint64', 15],

      // Variable length Records Header
      //===============================
      // The Public Header Block can be followed by any number of Variable Length Records (VLRs) so
      // long as the total size does not make the start of the Point Record data inaccessible by an
      // unsigned long (“Offset to Point Data” in the Public Header Block). The number of VLRs is
      // specified in the “Number of Variable Length Records” field in the Public Header Block. The
      // Variable Length Records must be accessed sequentially since the size of each variable length
      // record is contained in the Variable Length Record Header. Each Variable Length Record Header
      // is 54 bytes in length
      vlrReserved: ['skip', 2], // [*]
      vlrUserId: ['string', 16],
      vlrRecordId: 'uint16',
      vlrRecordLengthAfterHeader: 'uint16',
      vlrDescription: ['string', 16], // [*]

      // Variable Length Records
      //========================
      variableLengthRecords: jBinary.Type({
        read: function(header) {
          return this.binary.seek(header.headerSize, function() {
            var data = new jDataView(header.vlrRecordLengthAfterHeader);
						var VLR = this.getType(['variableLengthRecordTemplate', header]);
						for (i = 0; i < header.numberOfVariableLengthRecords; i++) {
              // TODO: figure out how to write data to the `data` variable
              var record = this.read(VLR);
              console.log(record)
							// data.seek(4 * y * width);
              // data.writeBytes([color.r, color.g, color.b, 'a' in color ? color.a : 255]);
						}
						return data.getBytes(undefined, 0);
          });

        }
      }),

      // Point Data records
      //===================
      pointData: jBinary.Type({
        read: function(header) {
          return this.binary.seek(header.offsetToPointData, function() {
            return this.getType(['pointDataTemplate', header]);
          });
        }
      }),

      // Extended Variable Length Records Header
      //========================================
      elvrReserved: ['skip', 2], // [*]
      elvrUserId: ['string', 16],
      elvrRecordId: 'uint16',
      elvrRecordLengthAfterHeader: 'uint64',
      elvrDescription: ['string', 32], // [*]

      // Extended Variable Length Records
      //=================================
      extendedVariableLengthRecords: jBinary.Type({
        read: function(header) {
          // header.startOfFirstExtendedVariableLengthRecord
          return this.binary.seek(0, function() {
            return this.getType([
              'extendedVariableLengthRecordTemplate',
              header
            ]);
          });
        }
      })
    }
  ]
};
