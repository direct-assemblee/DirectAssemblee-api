let moment = require('moment');
moment.locale('fr');

const DATE_AND_HOUR_TEMPLATE = 'yyyy-MM-ddTHH:mm:ss';

let self = module.exports = {
    DATE_AND_HOUR_TEMPLATE:DATE_AND_HOUR_TEMPLATE,

    findAge: function(birthdate) {
        let date = self.formatDateWithTemplate(birthdate, 'YYYY-MM-DD', 'YYYY-MM-DD');
        return Math.floor(self.getDaysFromNow(date) / 365)
    },

    formatDate: function(dateString) {
        return self.formatDateWithTemplate(dateString, 'DD/MM/YYYY', 'YYYY-MM-DD');
    },

    formatDateForWS: function(dateString) {
        return self.formatDateWithTemplate(dateString, 'YYYY-MM-DD', 'DD/MM/YYYY');
    },

    formatWrittenDate: function(dateString) {
        return self.formatDateWithTemplate(dateString, 'DD MMMM YYYY', 'YYYY-MM-DD');
    },

    formatMomentWithTemplate: function(date, formatTemplate) {
        return moment(date).format(formatTemplate);
    },

    formatDateWithTemplate: function(dateString, parseTemplate, formatTemplate) {
        return moment(dateString, parseTemplate).format(formatTemplate);
    },

    getDaysFromNow: function(start) {
        return self.getDiffInDays(start, moment());
    },

    getDiffInDays: function(date1, date2) {
        var diff = 0;
        if (date1 && date2) {
            diff = moment(date2, 'YYYY-MM-DD').diff(moment(date1, 'YYYY-MM-DD'), 'days');
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
