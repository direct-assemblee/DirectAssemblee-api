require('../../bootstrap');

let Promise = require('bluebird');
let moment = require('moment');

let getCreateDeputiesPromises = function() {
    let promises = [];
    promises.push(Department.create({ id: 1 }))
    promises.push(Department.create({ id: 2 }))
    promises.push(Deputy.create({ officialId: 12, departmentId: 1, district: 1, currentMandateStartDate: "2016-06-18" }))
    promises.push(Deputy.create({ officialId: 13, departmentId: 1, district: 2, currentMandateStartDate: "2017-08-18" }))
    promises.push(Deputy.create({ officialId: 14, departmentId: 1, district: 1, currentMandateStartDate: "2017-06-18" }))

    let startDate = moment().subtract(5, 'months').format('YYYY-MM-DD');
    promises.push(Deputy.create({ officialId: 15, departmentId: 1, district: 1, currentMandateStartDate: startDate }))
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

    it('should add parliamentAge for deputy', function(done) {
        Deputy.findOne({ officialId: 15 })
        .then(function(deputyIn) {
            DeputyService.retrieveParliamentAgeForDeputy(deputyIn)
            .then(function(resultingDeputy) {
                resultingDeputy.parliamentAgeInMonths.should.equal(7)
                done();
            })
        })
        .catch(done);
    })

    it('should add declarations for deputy', function(done) {
        Deputy.findOne({ officialId: 15 })
        .then(function(deputyIn) {
            DeputyService.retrieveDeclarationsForDeputy(deputyIn)
            .then(function(resultingDeputy) {
                resultingDeputy.declarations.length.should.equal(2);
                resultingDeputy.declarations[0].date.should.equal('22/12/2016');
                should.not.exist(resultingDeputy.declarations[0].createdId);
                should.not.exist(resultingDeputy.declarations[0].updatedAt);
                should.not.exist(resultingDeputy.declarations[0].id);
                should.not.exist(resultingDeputy.declarations[0].deputyId);
                resultingDeputy.declarations[1].date.should.equal('13/01/2016');
                should.not.exist(resultingDeputy.declarations[1].deputyId);
                should.not.exist(resultingDeputy.declarations[1].createdId);
                should.not.exist(resultingDeputy.declarations[1].updatedAt);
                should.not.exist(resultingDeputy.declarations[1].id);
                done();
            })
        })
        .catch(done);
    })

    it('should add salary for deputy', function(done) {
        Deputy.findOne({ officialId: 15 })
        .then(function(deputyIn) {
            DeputyService.retrieveSalaryForDeputy(deputyIn)
            .then(function(resultingDeputy) {
                resultingDeputy.salary.should.equal(ExtraPositionService.SALARY_BASE + ExtraPositionService.SALARY_SECRETARY);
                done();
            })
        })
        .catch(done);
    })

    //
    // it('should add activityRate for deputy', function(done) {
    //     Deputy.findOne({ officialId: 15 })
    //     .then(function(deputyIn) {
    //         DeputyService.retrieveSalaryForDeputy(deputyIn)
    //         .then(function(resultingDeputy) {
    //             resultingDeputy.salary.should.equal(ExtraPositionService.SALARY_BASE + ExtraPositionService.SALARY_SECRETARY);
    //             done();
    //         })
    //     })
    //     .catch(done);
    // })
});
