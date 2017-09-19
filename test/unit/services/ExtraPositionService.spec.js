require('../../bootstrap');

let Promise = require('bluebird');

describe('The ExtraPositionService', function () {
    before(function(done) {
        let promises = [];
        promises.push(ExtraPosition.create({ deputyId: 3, position: 'Membre' }))
        promises.push(ExtraPosition.create({ deputyId: 4, position: 'Président', office: 'Assemblée nationale' }))
        promises.push(ExtraPosition.create({ deputyId: 41, position: 'Présidente', office: 'Assemblée nationale' }))
        promises.push(ExtraPosition.create({ deputyId: 5, position: 'Questeur', office: 'Assemblée nationale' }))
        promises.push(ExtraPosition.create({ deputyId: 51, position: 'Questeur', office: 'Assemblée nationale' }))
        promises.push(ExtraPosition.create({ deputyId: 6, position: 'Vice-président', office: 'Assemblée nationale' }))
        promises.push(ExtraPosition.create({ deputyId: 61, position: 'Vice-présidente', office: 'Assemblée nationale' }))
        Promise.all(promises)
        .then(function() {
            done();
        })
    });

    after(function(done) {
        let promises = [];
        promises.push(ExtraPosition.destroy({ deputyId: 3 }))
        promises.push(ExtraPosition.destroy({ deputyId: 4 }))
        promises.push(ExtraPosition.destroy({ deputyId: 41 }))
        promises.push(ExtraPosition.destroy({ deputyId: 5 }))
        promises.push(ExtraPosition.destroy({ deputyId: 51 }))
        promises.push(ExtraPosition.destroy({ deputyId: 6 }))
        promises.push(ExtraPosition.destroy({ deputyId: 61 }))
        Promise.all(promises)
        .then(function() {
            done();
        })
    });

    it('should return extra position for deputy with id', function(done) {
        ExtraPositionService.findExtraPositionsForDeputy(3)
        .then(function(extraPositions) {
            extraPositions.length.should.equal(1)
            extraPositions[0].deputyId.should.equal('3')
            done();
        })
        .catch(done);
    });

    it('should return no extra position for deputy with id', function(done) {
        ExtraPositionService.findExtraPositionsForDeputy('30')
        .then(function(extraPositions) {
            extraPositions.length.should.equal(0)
            done();
        })
        .catch(done);
    });

    it('should return salary for regular deputy', function(done) {
        ExtraPositionService.getSalaryForDeputy(3)
        .then(function(salary) {
            salary.should.equal(ExtraPositionService.SALARY_BASE);
            done();
        })
        .catch(done);
    });

    it('should return salary for male president', function(done) {
        ExtraPositionService.getSalaryForDeputy(4)
        .then(function(salary) {
            salary.should.equal(ExtraPositionService.SALARY_BASE + ExtraPositionService.SALARY_PRESIDENT);
            done();
        })
        .catch(done);
    });

    it('should return salary for female president', function(done) {
        ExtraPositionService.getSalaryForDeputy(41)
        .then(function(salary) {
            salary.should.equal(ExtraPositionService.SALARY_BASE + ExtraPositionService.SALARY_PRESIDENT);
            done();
        })
        .catch(done);
    });

    it('should return salary for male questers', function(done) {
        ExtraPositionService.getSalaryForDeputy(5)
        .then(function(salary) {
            salary.should.equal(ExtraPositionService.SALARY_BASE + ExtraPositionService.SALARY_QUESTER);
            done();
        })
        .catch(done);
    });

    it('should return salary for female questers', function(done) {
        ExtraPositionService.getSalaryForDeputy(51)
        .then(function(salary) {
            salary.should.equal(ExtraPositionService.SALARY_BASE + ExtraPositionService.SALARY_QUESTER);
            done();
        })
        .catch(done);
    });

    it('should return salary for male vice president', function(done) {
        ExtraPositionService.getSalaryForDeputy(6)
        .then(function(salary) {
            salary.should.equal(ExtraPositionService.SALARY_BASE + ExtraPositionService.SALARY_VICE_PRESIDENT);
            done();
        })
        .catch(done);
    });

    it('should return salary for female vice president', function(done) {
        ExtraPositionService.getSalaryForDeputy(61)
        .then(function(salary) {
            salary.should.equal(ExtraPositionService.SALARY_BASE + ExtraPositionService.SALARY_VICE_PRESIDENT);
            done();
        })
        .catch(done);
    });
});
