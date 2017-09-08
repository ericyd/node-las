const jBinary = require('jbinary');
const binaryTypeset = require('./binaryTypeset');

const leftPad2 = value => {
  if (String(value).length < 2) return `0${value}`;
  return value;
};

const formatDatetime = (d = new Date(), includeTimestamp = false) => {
  if (typeof d === 'string') d = new Date(d);
  // month is 0-indexed, need to be padded
  const month =
    d.getMonth() < 10 ? leftPad2(d.getMonth() + 1) : d.getMonth() + 1;
  const day = leftPad2(d.getDate());
  const year = d.getFullYear();
  const hours =
    d.getHours() > 12 ? leftPad2(d.getHours() - 12) : leftPad2(d.getHours());
  const minutes = leftPad2(d.getMinutes());
  const seconds = leftPad2(d.getSeconds());
  const ampm = d.getHours() > 12 ? 'pm' : 'am';
  return includeTimestamp
    ? `${month}-${day}-${year} ${hours}:${minutes}:${seconds} ${ampm}`
    : `${month}-${day}-${year}`;
};

/**
 * Read data from binary, and apply function `f` to the data.
 * Calculate new binary size after applying `f` and return a new binary
 * instance containing the mapped data.
 * @param {function} f should accept options as first param and binary as the second param
 * @param {any} options
 * @param {jBinary} binary
 */
const mapBinary = (f, options, binary) => {
  const data = binary.readAll();
  const header = data.header;
  const pointFormat = binary.typeSet[`pointFormat${header.pointFormat}`];
  const numberOfPoints =
    header.versionMinor < 4
      ? header.legacyNumberOfPoints
      : header.numberOfPoints;
  const points = binary.read(
    ['array', pointFormat, numberOfPoints],
    header.offsetToPoints
  );
  const oldLength = data.points.length;
  data.points = f(options, points);

  // Must create new instance rather than mutate existing because memory is statically allocated.
  // New size is based on new number of points
  // https://github.com/jDataView/jBinary/issues/48
  const newLength =
    binary.view.byteLength -
    (oldLength - data.points.length) *
      binary.typeSet.sizes[`pointFormat${header.pointFormat}`];
  const newBinary = new jBinary(newLength, binaryTypeset);
  newBinary.writeAll(data);
  return newBinary;
};

module.exports = {
  formatDatetime: formatDatetime,
  mapBinary: mapBinary,
  log: console.log.bind(console, `LOG ${formatDatetime(new Date(), true)}`),
  warn: console.warn.bind(console, 'WARNING!'),
  error: console.error.bind(console, 'ERROR!')
};
