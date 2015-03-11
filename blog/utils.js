var months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
];
module.exports = {
  getMonth: function (index) {
    return months[index - 1];
  }
};
