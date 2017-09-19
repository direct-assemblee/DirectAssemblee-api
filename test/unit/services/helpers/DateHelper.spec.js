require('../../../bootstrap');
let DateHelper = require('../../../../api/services/helpers/DateHelper.js')
let moment = require('moment');

describe('The DateHelper', function () {
    it('should format date', function(done) {
        let formattedDate = DateHelper.formatDate('13/01/2012')
        formattedDate.should.equal('2012-01-13')
        done();
    });

    it('should format date for WS', function(done) {
        let formattedDate = DateHelper.formatDateForWS('13/01/2012')
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

    it('should return duration in days', function(done) {
        let now = moment();
        let startDate = moment(now).subtract(45, 'days');
        let endDate = moment(now).subtract(10, 'days');
        let duration = DateHelper.getDurationInDays(startDate, endDate)
        duration.should.equal(35)
        done();
    });

    it('should sort items - most recet first', function(done) {
        let now = moment();
        let recentDate = moment(now).subtract(10, 'days');
        let olderDate = moment(now).subtract(18, 'days');
        let oldestDate = moment(now).subtract(40, 'days');
        let sortedDates = DateHelper.sortItemsWithDate([ { date: oldestDate }, { date: recentDate }, { date: olderDate }]);
        sortedDates.length.should.equal(3);
        sortedDates[0].date.should.equal(recentDate);
        sortedDates[1].date.should.equal(olderDate);
        sortedDates[2].date.should.equal(oldestDate);
        done();
    });
});
