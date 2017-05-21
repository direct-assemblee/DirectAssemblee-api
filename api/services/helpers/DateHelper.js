var moment = require('moment');

var self = module.exports = {
  formatDate: function(dateString) {
    return self.formatDateWithTemplate(dateString, "DD/MM/YYYY", "YYYY-MM-DD");
  },

  formatDateForWS: function(dateString) {
    return self.formatDateWithTemplate(dateString, "DD/MM/YYYY", "DD/MM/YYYY");
  },

  formatWrittenDate: function(dateString) {
    return self.formatDateWithTemplate(dateString, "DD MMMM YYYY", "YYYY-MM-DD");
  },

  formatDateWithTemplate: function(dateString, parseTemplate, formatTemplate) {
    moment.locale('fr')
    var parsedDate = moment(dateString, parseTemplate);
    return moment(parsedDate).format(formatTemplate);
  },

  getDaysFromNow: function(start) {
    return self.getDurationInDays(start, moment());
  },

  getDurationInDays: function(start, end) {
    return self.getDiff(end, start)
  },

  getDiff: function(date1, date2) {
    var diff = 0;
    if (date1 && date2) {
      diff = moment(date1, "DD/MM/YYYY").diff(moment(date2, "DD/MM/YYYY"), 'days');
    }
    return diff;
  },

  convertDaysToYears: function(days) {
    return Math.floor(days / 365);
  },

  getDateForMonthsBack: function(numberOfMonths) {
    return self.substractMonthsAndFormat(moment(), numberOfMonths);
  },

  substractMonthsAndFormat: function(date, numberOfMonths) {
    var newDate = moment(date).subtract(numberOfMonths, "months");
    return newDate.format("YYYY-MM-DD");
  },

  isLaterSameDay: function(date1, date2) {
    var result = false;
    if (self.formatSimpleDate(date1) == self.formatSimpleDate(date2)) {
      result = moment(date1) >= moment(date2);
    }
    return result
  },

  formatSimpleDate: function(date) {
    return moment(date).format("YYYY-MM-DD");
  },

  formattedNow: function() {
    return formatSimpleDate(moment());
  }
}
