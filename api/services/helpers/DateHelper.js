var moment = require('moment');

var self = module.exports = {
  formatDate: function(dateString) {
    return self.formatDateWithTemplate(dateString, "DD/MM/YYYY", "YYYY-MM-DD");
  },

  formatWrittenDate: function(dateString) {
    return self.formatDateWithTemplate(dateString, "DD MMMM YYYY", "YYYY-MM-DD");
  },

  formatDateWithTemplate: function(dateString, parseTemplate, formatTemplate) {
    moment.locale('fr')
    var parsedDate = moment(dateString, parseTemplate);
    return moment(parsedDate).format(formatTemplate);
  },

  getDurationInDays: function(start, end) {
    var dur = 0;
    if (start && end) {
      dur = moment(end).diff(moment(start), 'days');
    }
    return dur;
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

  formattedNow: function() {
    return moment().format("YYYY-MM-DD");
  }
}
