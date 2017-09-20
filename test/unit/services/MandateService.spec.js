require('../../bootstrap');

let moment = require('moment');
let Promise = require('bluebird');

let today = moment().format('DD/MM/YYYY');

describe('The MandaService', function () {
    before(function(done) {
        let promises = [];
        promises.push(Mandate.create({ deputyId: 3, name: 'Très petit mandat', startingDate: '2014-06-04', endingDate: '2014-08-04' }))
        promises.push(Mandate.create({ deputyId: 4, name: 'Petit mandat', startingDate: '2012-06-04', endingDate: '2014-08-04' }))
        promises.push(Mandate.create({ deputyId: 5, name: 'Petit mandat', startingDate: '2012-06-04', endingDate: '2014-08-04' }))
        promises.push(Mandate.create({ deputyId: 5, name: 'Autre mandat', startingDate: '2009-01-28', endingDate: '2012-08-04' }))
        promises.push(Mandate.create({ deputyId: 5, name: 'Autre mandat', startingDate: '2006-01-28', endingDate: '2006-05-23' }))
        Promise.all(promises)
        .then(function() {
            done();
        })
    });

    after(function(done) {
        let promises = [];
        promises.push(Mandate.destroy({ deputyId: 3 }))
        Promise.all(promises)
        .then(function() {
            done();
        })
    });

    it('should return political age for deputy with no experience', function(done) {
        MandateService.getPoliticalAgeOfDeputy('2', today)
        .then(function(age) {
            age.should.equal(0);
            done();
        })
        .catch(done);
    });

    it('should return political age for unexperienced deputy', function(done) {
        MandateService.getPoliticalAgeOfDeputy('3', today)
        .then(function(age) {
            age.should.equal(2);
            done();
        })
        .catch(done);
    });

    it('should return political age for unexperienced deputy and current mandate well started', function(done) {
        let currentMandateStartDate = moment().subtract(3, 'years').format('DD/MM/YYYY');
        MandateService.getPoliticalAgeOfDeputy('3', currentMandateStartDate)
        .then(function(age) {
            age.should.equal(38);
            done();
        })
        .catch(done);
    });

    it('should return political age for deputy with only one experience', function(done) {
        MandateService.getPoliticalAgeOfDeputy('4', today)
        .then(function(age) {
            age.should.equal(26);
            done();
        })
        .catch(done);
    });

    it('should return political age for deputy with only one experience and current mandate well started', function(done) {
        let currentMandateStartDate = moment().subtract(3, 'years').format('DD/MM/YYYY');
        MandateService.getPoliticalAgeOfDeputy('4', currentMandateStartDate)
        .then(function(age) {
            age.should.equal(62);
            done();
        })
        .catch(done);
    });

    it('should return political age for deputy with much experience', function(done) {
        MandateService.getPoliticalAgeOfDeputy('5', today)
        .then(function(age) {
            age.should.equal(72);
            done();
        })
        .catch(done);
    });

    it('should return political age deputy with much experience and current mandate well started', function(done) {
        let currentMandateStartDate = moment().subtract(3, 'years').add(2, 'days').format('DD/MM/YYYY');
        MandateService.getPoliticalAgeOfDeputy('5', currentMandateStartDate)
        .then(function(age) {
            age.should.equal(107);
            done();
        })
        .catch(done);
    });
});
