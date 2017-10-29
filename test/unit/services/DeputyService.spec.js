require('../../bootstrap');

let Promise = require('bluebird');
let moment = require('moment');

let getCreateDeputiesPromises = function() {
    let promises = [];
    promises.push(Department.create({ id: 1 }))
    promises.push(Department.create({ id: 2 }))
    promises.push(Deputy.create({ officialId: 12, departmentId: 1, district: 1, currentMandateStartDate: '2016-06-18', mandateEndDate: null }))
    promises.push(Deputy.create({ officialId: 13, departmentId: 1, district: 2, currentMandateStartDate: '2017-08-18', mandateEndDate: null }))
    promises.push(Deputy.create({ officialId: 14, departmentId: 1, district: 1, currentMandateStartDate: '2017-06-18', mandateEndDate: null }))
    promises.push(Deputy.create({ officialId: 14, departmentId: 30, district: 1, currentMandateStartDate: null, mandateEndDate: '2017-06-18' }))

    let startDate = moment().subtract(5, 'months').format('YYYY-MM-DD');
    promises.push(Deputy.create({ officialId: 15, departmentId: 1, district: 1, currentMandateStartDate: startDate, mandateEndDate: null }))
    return promises;
}

let getExtraPromises = function() {
    let promises = [];
    promises.push(Mandate.create({ deputyId: 15, name: 'Très petit mandat', startingDate: '2014-06-04', endingDate: '2014-08-04' }))
    promises.push(Declaration.create({ deputyId: 15, date: '2016-12-22' }))
    promises.push(Declaration.create({ deputyId: 15, date: '2016-01-13' }))
    promises.push(ExtraPosition.create({ deputyId: 15, position: 'Secrétaire', office: 'Assemblée nationale' }))
    return promises;
}

describe('The DeputyService', function () {
    before(function(done) {
        let promises = getCreateDeputiesPromises();
        promises = promises.concat(getExtraPromises())
        Promise.all(promises)
        .then(function() {
            done();
        })
    });

    after(function(done) {
        let promises = [];
        promises.push(Deputy.destroy())
        promises.push(Declaration.destroy())
        Promise.all(promises)
        .then(function() {
            done();
        })
    });

    it('should return deputy with given id', function(done) {
        DeputyService.findDeputyWithId(12)
        .then(function(deputy) {
            should.exist(deputy);
            deputy.officialId.should.equal('12')
            done();
        })
        .catch(done);
    });

    it('should return no deputy with given id', function(done) {
        DeputyService.findDeputyWithId(222)
        .then(function(deputy) {
            should.not.exist(deputy);
            done();
        })
        .catch(done);
    });

    it('should return most recent deputy', function(done) {
        DeputyService.findMostRecentDeputyAtDate(1, 1, '12/12/2017')
        .then(function(deputy) {
            should.exist(deputy);
            deputy.officialId.should.equal('14')
            done();
        })
        .catch(done);
    });

    it('should return most recent deputy one year ago', function(done) {
        DeputyService.findMostRecentDeputyAtDate(1, 1, '12/12/2016')
        .then(function(deputy) {
            should.exist(deputy);
            deputy.officialId.should.equal('12')
            done();
        })
        .catch(done);
    });

    it('should return no most recent deputy wrong departmentId', function(done) {
        DeputyService.findMostRecentDeputyAtDate(10, 1, '12/12/2017')
        .then(function(deputy) {
            should.not.exist(deputy);
            done();
        })
        .catch(done);
    });

    it('should return no most recent deputy wrong district', function(done) {
        DeputyService.findMostRecentDeputyAtDate(1, 10, '12/12/2017')
        .then(function(deputy) {
            should.not.exist(deputy);
            done();
        })
        .catch(done);
    });

    it('should return current deputies', function(done) {
        DeputyService.findCurrentDeputies()
        .then(function(deputies) {
            should.exist(deputies);
            deputies.length.should.equal(4);
            done();
        })
        .catch(done);
    });
});
