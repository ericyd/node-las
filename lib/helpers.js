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

module.exports = {
  formatDatetime: formatDatetime,
  log: console.log.bind(console, `LOG ${formatDatetime(new Date(), true)}`),
  warn: console.warn.bind(console, 'WARNING!'),
  error: console.error.bind(console, 'ERROR!')
};
