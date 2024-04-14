// Convert time string i.e. '2:40' to seconds number (160)
// Also allows h:m:s format and mm:ss, m:s etc.
const parseTime = function (hms) {
  const [seconds, minutes, hours] = hms.split(':').reverse();
  let sum = null;
  if (!isNaN(seconds)) {
    sum = (+hours || 0) * 60 * 60 + (+minutes || 0) * 60 + (+seconds);
  }
  return sum;
};

export { parseTime };
