let moment = require('moment');

let self = module.exports = {
    formatDate: function(dateString) {
        return self.formatDateWithTemplate(dateString, 'DD/MM/YYYY', 'YYYY-MM-DD');
    },

    formatDateForWS: function(dateString) {
        return self.formatDateWithTemplate(dateString, 'DD/MM/YYYY', 'DD/MM/YYYY');
    },

    formatWrittenDate: function(dateString) {
        return self.formatDateWithTemplate(dateString, 'DD MMMM YYYY', 'YYYY-MM-DD');
    },

    formatDateWithTemplate: function(dateString, parseTemplate, formatTemplate) {
        moment.locale('fr')
        var parsedDate = moment(dateString, parseTemplate);
        return moment(parsedDate).format(formatTemplate);
    },

    getDaysFromNow: function(start) {
        return self.getDiffInDays(start, moment());
    },

    sortItemsWithDate: function(items) {
        items.sort(function(a, b) {
            var diff = self.getDiffInDays(a.date, b.date);
            var result = diff == 0 ? 0 : diff > 0 ? 1 : -1;
            return result
        });
        return items;
    },

    getDiffInDays: function(date1, date2) {
        var diff = 0;
        if (date1 && date2) {
            diff = moment(date2, 'DD/MM/YYYY').diff(moment(date1, 'DD/MM/YYYY'), 'days');
        }
        return diff;
    },

    convertDaysToMonths: function(days) {
        return Math.floor(days * 12 / 365);
    },

    getDateForMonthsBack: function(numberOfMonths) {
        return self.substractAndFormat(moment(), numberOfMonths, 'months');
    },

    substractAndFormat: function(date, quantity, timeUnit) {
        var newDate = moment(date).subtract(quantity, timeUnit);
        return newDate.format('YYYY-MM-DD');
    },

    isLaterOrSame: function(date1, date2) {
        return self.formatSimpleDate(date1) >= self.formatSimpleDate(date2);
    },

    formatSimpleDate: function(date) {
        return moment(date).format('YYYY-MM-DD');
    },

    getFormattedNow: function() {
        return self.formatSimpleDate(moment());
    }
}
