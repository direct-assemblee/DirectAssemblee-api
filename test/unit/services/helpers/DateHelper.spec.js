require('../../../bootstrap.test');
let DateHelper = require('../../../../api/services/helpers/DateHelper.js')
let moment = require('moment');

describe('The DateHelper', function () {
    it('should format date', function(done) {
        let formattedDate = DateHelper.formatDate('13/01/2012')
        formattedDate.should.equal('2012-01-13')
        done();
    });

    it('should format date for WS', function(done) {
        let formattedDate = DateHelper.formatDateForWS('2012-01-13')
        formattedDate.should.equal('13/01/2012')
        done();
    });

    it('should format written date', function(done) {
        let formattedDate = DateHelper.formatWrittenDate('13 Janvier 2012')
        formattedDate.should.equal('2012-01-13')
        done();
    });

    it('should format date with template', function(done) {
        let formattedDate = DateHelper.formatDateWithTemplate('2012-01-13', 'YYYY-MM-DD', 'DD-MM-YYYY')
        formattedDate.should.equal('13-01-2012')
        done();
    });

    it('should return days from now', function(done) {
        let now = moment();
        let startDate = moment(now).subtract(10, 'days');
        let daysFromNow = DateHelper.getDaysFromNow(startDate)
        daysFromNow.should.equal(10)
        done();
    });

    it('should return diff in days', function(done) {
        let now = moment();
        let startDate = moment(now).subtract(45, 'days');
        let endDate = moment(now).subtract(10, 'days');
        let duration = DateHelper.getDiffInDays(startDate, endDate)
        duration.should.equal(35)
        done();
    });

    it('should convert days to months', function(done) {
        let months = DateHelper.convertDaysToMonths(110);
        months.should.equal(3);
        done();
    });

    it('should return date for x months back', function(done) {
        let expected = moment().subtract(3, 'months').format('YYYY-MM-DD');
        let date = DateHelper.getDateForMonthsBack(3);
        date.should.equal(expected);
        done();
    });

    it('should return formated date after subtraction', function(done) {
        let givenDate = moment('22/02/2017', 'DD/MM/YYYY');
        let expected = '2015-02-22';
        let date = DateHelper.subtractAndFormat(givenDate, 2, 'years');
        date.should.equal(expected);
        done();
    });

    it('should return true : date is later', function(done) {
        let olderDate = moment().subtract(3, 'months');
        let isLater = DateHelper.isLaterOrSame(moment(), olderDate);
        isLater.should.equal(true);
        done();
    });

    it('should return false : date is not later', function(done) {
        let olderDate = moment().subtract(3, 'months');
        let isLater = DateHelper.isLaterOrSame(olderDate, moment());
        isLater.should.equal(false);
        done();
    });

    it('should return true : dates are same', function(done) {
        let olderDate = moment().subtract(3, 'months');
        let isLater = DateHelper.isLaterOrSame(olderDate, olderDate);
        isLater.should.equal(true);
        done();
    });

    it('should return formatted date as YYYY-MM-DD', function(done) {
        let givenDate = moment('22/02/2017', 'DD/MM/YYYY');
        let formattedDate = DateHelper.formatSimpleDate(givenDate);
        formattedDate.should.equal('2017-02-22');
        done();
    });

    it('should return today formated as YYYY-MM-DD', function(done) {
        let expected = moment().format('YYYY-MM-DD');
        let formattedDate = DateHelper.getFormattedNow();
        formattedDate.should.equal(expected);
        done();
    });
});
