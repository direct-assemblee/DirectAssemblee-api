require('../../bootstrap.test');

let Promise = require('bluebird');

describe('The ExtraPositionService', function () {
    before(function(done) {
        let promises = [];
        promises.push(ExtraPosition.create({ deputyId: 2, position: 'Secrétaire', office: 'Assemblée nationale' }))
        promises.push(ExtraPosition.create({ deputyId: 3, position: 'Membre' }))
        promises.push(ExtraPosition.create({ deputyId: 4, position: 'Président', office: 'Assemblée nationale' }))
        promises.push(ExtraPosition.create({ deputyId: 41, position: 'Présidente', office: 'Assemblée nationale' }))
        promises.push(ExtraPosition.create({ deputyId: 5, position: 'Questeur', office: 'Assemblée nationale' }))
        promises.push(ExtraPosition.create({ deputyId: 51, position: 'Questeur', office: 'Assemblée nationale' }))
        promises.push(ExtraPosition.create({ deputyId: 6, position: 'Vice-président', office: 'Assemblée nationale' }))
        promises.push(ExtraPosition.create({ deputyId: 61, position: 'Vice-présidente', office: 'Assemblée nationale' }))
        promises.push(ExtraPosition.create({ deputyId: 7, position: 'Président', office: 'Commission des conneries' }))
        promises.push(ExtraPosition.create({ deputyId: 71, position: 'Présidente', office: 'Commission de la révolution' }))
        promises.push(ExtraPosition.create({ deputyId: 8, position: 'Rapporteur général', office: 'Commission des finances' }))
        promises.push(ExtraPosition.create({ deputyId: 81, position: 'Rapporteure générale', office: 'Commission des finances' }))
        promises.push(ExtraPosition.create({ deputyId: 82, position: 'Rapporteur général', office: 'Commission de la bienveillance' }))
        promises.push(ExtraPosition.create({ deputyId: 9, position: 'Président', office: 'Office parlementaire d\'évaluation des choix scientifiques et technologiques' }))
        promises.push(ExtraPosition.create({ deputyId: 91, position: 'Président', office: 'Office parlementaire d\'évaluation des choix scientifiques et technologiques' }))

        Promise.all(promises)
        .then(function() {
            done();
        })
    });

    after(function(done) {
        let promises = [];
        promises.push(ExtraPosition.destroy({}))
        Promise.all(promises)
        .then(function() {
            done();
        })
    });

    it('should return extra position for deputy with id', function(done) {
        ExtraPositionService.findExtraPositionsForDeputy(3)
        .then(function(extraPositions) {
            extraPositions.length.should.equal(1)
            extraPositions[0].deputyId.should.equal(3)
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

    it('should return salary for secretary', function(done) {
        ExtraPositionService.getSalaryForDeputy(2)
        .then(function(salary) {
            salary.should.equal(ExtraPositionService.SALARY_BASE + ExtraPositionService.SALARY_SECRETARY);
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

    it('should return salary for male commission president', function(done) {
        ExtraPositionService.getSalaryForDeputy(7)
        .then(function(salary) {
            salary.should.equal(ExtraPositionService.SALARY_BASE + ExtraPositionService.SALARY_COMMISSION_PRESIDENT);
            done();
        })
        .catch(done);
    });

    it('should return salary for female commission president', function(done) {
        ExtraPositionService.getSalaryForDeputy(71)
        .then(function(salary) {
            salary.should.equal(ExtraPositionService.SALARY_BASE + ExtraPositionService.SALARY_COMMISSION_PRESIDENT);
            done();
        })
        .catch(done);
    });

    it('should return salary for male general reporter', function(done) {
        ExtraPositionService.getSalaryForDeputy(8)
        .then(function(salary) {
            salary.should.equal(ExtraPositionService.SALARY_BASE + ExtraPositionService.SALARY_GENERAL_REPORTER);
            done();
        })
        .catch(done);
    });

    it('should return salary for female general reporter', function(done) {
        ExtraPositionService.getSalaryForDeputy(81)
        .then(function(salary) {
            salary.should.equal(ExtraPositionService.SALARY_BASE + ExtraPositionService.SALARY_GENERAL_REPORTER);
            done();
        })
        .catch(done);
    });

    it('should return salary for other reporter', function(done) {
        ExtraPositionService.getSalaryForDeputy(82)
        .then(function(salary) {
            salary.should.equal(ExtraPositionService.SALARY_BASE);
            done();
        })
        .catch(done);
    });

    it('should return salary for male scientific choice president', function(done) {
        ExtraPositionService.getSalaryForDeputy(9)
        .then(function(salary) {
            salary.should.equal(ExtraPositionService.SALARY_BASE + ExtraPositionService.SALARY_SCIENTIFIC_CHOICE_PRESIDENT);
            done();
        })
        .catch(done);
    });

    it('should return salary for female scientific choice president', function(done) {
        ExtraPositionService.getSalaryForDeputy(91)
        .then(function(salary) {
            salary.should.equal(ExtraPositionService.SALARY_BASE + ExtraPositionService.SALARY_SCIENTIFIC_CHOICE_PRESIDENT);
            done();
        })
        .catch(done);
    });
});
