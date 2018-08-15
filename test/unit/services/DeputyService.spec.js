require('../../bootstrap.test');

let Promise = require('bluebird');
let moment = require('moment');

let getCreateDeputiesPromises = function() {
    let promises = [];
    promises.push(Department.create({ id: 1 }))
    promises.push(Department.create({ id: 2 }))
    promises.push(Deputy.create({ officialId: 12, departmentId: 1, district: 1, currentMandateStartDate: '2016-06-18', mandateEndDate: '' }))
    promises.push(Deputy.create({ officialId: 13, departmentId: 1, district: 2, currentMandateStartDate: '2017-08-18', mandateEndDate: '' }))
    promises.push(Deputy.create({ officialId: 14, departmentId: 1, district: 1, currentMandateStartDate: '2017-06-18', mandateEndDate: '' }))
    promises.push(Deputy.create({ officialId: 16, departmentId: 30, district: 1, currentMandateStartDate: '', mandateEndDate: '2017-06-18' }))
    promises.push(Deputy.create({ officialId: 17, departmentId: 30, district: 1, currentMandateStartDate: '2017-06-18', mandateEndDate: '' }))

    let startDate = moment().subtract(2, 'months').format('YYYY-MM-DD');
    promises.push(Deputy.create({ officialId: 15, departmentId: 1, district: 1, currentMandateStartDate: startDate, mandateEndDate: '' }))
    return promises;
}

let getExtraPromises = function() {
    let promises = [];
    promises.push(Mandate.create({ deputyId: 15, name: 'Très petit mandat', startingDate: '2014-06-04', endingDate: '2014-08-04' }))
    promises.push(Declaration.create({ deputyId: 15, date: '2016-12-22' }))
    promises.push(Declaration.create({ deputyId: 15, date: '2016-01-13' }))
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
        promises.push(Deputy.destroy({}))
        promises.push(Declaration.destroy({}))
        Promise.all(promises)
        .then(function() {
            done();
        })
    });

    it('should return deputy with given id', function(done) {
        DeputyService.findDeputyWithId(12)
        .then(function(deputy) {
            should.exist(deputy);
            deputy.officialId.should.equal(12)
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
        DeputyService.findMostRecentDeputyAtDate(1, 1, '2118-06-12')
        .then(function(deputy) {
            should.exist(deputy);
            deputy.officialId.should.equal(15)
            done();
        })
        .catch(done);
    });

    it('should return most recent deputy one year ago', function(done) {
        DeputyService.findMostRecentDeputyAtDate(1, 1, '2016-12-12')
        .then(function(deputy) {
            should.exist(deputy);
            deputy.officialId.should.equal(12)
            done();
        })
        .catch(done);
    });

    it('should return new deputy', function(done) {
        DeputyService.findMostRecentDeputyAtDate(30, 1, '2017-12-12')
        .then(function(deputy) {
            should.exist(deputy);
            deputy.officialId.should.equal(17)
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
            deputies.length.should.equal(5);
            done();
        })
        .catch(done);
    });
});
