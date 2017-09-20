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
        return self.getDurationInDays(start, moment());
    },

    getDurationInDays: function(start, end) {
        return self.getDiff(end, start)
    },

    sortItemsWithDate: function(items) {
        items.sort(function(a, b) {
            var diff = self.getDiff(b.date, a.date);
            var result = diff == 0 ? 0 : diff > 0 ? 1 : -1;
            return result
        });
        return items;
    },

    getDiff: function(date1, date2) {
        var diff = 0;
        if (date1 && date2) {
            diff = moment(date1, 'DD/MM/YYYY').diff(moment(date2, 'DD/MM/YYYY'), 'days');
        }
        return diff;
    },

    convertDaysToMonths: function(days) {
        return Math.floor(days * 12 / 365);
    },

    getDateForMonthsBack: function(numberOfMonths) {
        return self.substractAndFormat(moment(), numberOfMonths, 'months');
    },

    substractAndFormat: function(date, numberOfMonths, unit) {
        var newDate = moment(date).subtract(numberOfMonths, unit);
        return newDate.format('YYYY-MM-DD');
    },

    isLater: function(date1, date2) {
        var result = false;
        if (self.formatSimpleDate(date1) >= self.formatSimpleDate(date2)) {
            result = moment(date1) >= moment(date2);
        }
        return result
    },

    formatSimpleDate: function(date) {
        return moment(date).format('YYYY-MM-DD');
    },

    getFormattedNow: function() {
        return self.formatSimpleDate(moment());
    }
}
