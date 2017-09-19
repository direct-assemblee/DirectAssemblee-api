require('../../bootstrap');

let Promise = require('bluebird');

describe('The DeputyService', function () {
    before(function(done) {
        let promises = [];
        promises.push(Department.create({ id: 1 }))
        promises.push(Department.create({ id: 2 }))
        promises.push(Deputy.create({ officialId: 12, departmentId: 1, district: 1, currentMandateStartDate: "2016-06-18" }))
        promises.push(Deputy.create({ officialId: 13, departmentId: 1, district: 2, currentMandateStartDate: "2017-08-18" }))
        promises.push(Deputy.create({ officialId: 14, departmentId: 1, district: 1, currentMandateStartDate: "2017-06-18" }))
        Promise.all(promises)
        .then(function() {
            done();
        })
    });

    after(function(done) {
        let promises = [];
        promises.push(Deputy.destroy({ officialId: 12 }))
        promises.push(Deputy.destroy({ officialId: 13 }))
        promises.push(Deputy.destroy({ officialId: 14 }))
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
});
