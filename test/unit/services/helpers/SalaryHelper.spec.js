require('../../../bootstrap.test');
let SalaryHelper = require('../../../../api/services/helpers/SalaryHelper.js')

describe('The SalaryHelper', function () {
    before(function(done) {
    let promises = [];
        // promises.push(ExtraPosition.create({ deputyId: 2, position: 'Secrétaire', office: 'Assemblée nationale' }))
        // promises.push(ExtraPosition.create({ deputyId: 3, position: 'Membre' }))
        // promises.push(ExtraPosition.create({ deputyId: 4, position: 'Président', office: 'Assemblée nationale' }))
        // promises.push(ExtraPosition.create({ deputyId: 41, position: 'Présidente', office: 'Assemblée nationale' }))
        // promises.push(ExtraPosition.create({ deputyId: 5, position: 'Questeur', office: 'Assemblée nationale' }))
        // promises.push(ExtraPosition.create({ deputyId: 51, position: 'Questeur', office: 'Assemblée nationale' }))
        // promises.push(ExtraPosition.create({ deputyId: 6, position: 'Vice-président', office: 'Assemblée nationale' }))
        // promises.push(ExtraPosition.create({ deputyId: 61, position: 'Vice-présidente', office: 'Assemblée nationale' }))
        // promises.push(ExtraPosition.create({ deputyId: 7, position: 'Président', office: 'Commission des conneries' }))
        // promises.push(ExtraPosition.create({ deputyId: 71, position: 'Présidente', office: 'Commission de la révolution' }))
        // promises.push(ExtraPosition.create({ deputyId: 8, position: 'Rapporteur général', office: 'Commission des finances' }))
        // promises.push(ExtraPosition.create({ deputyId: 81, position: 'Rapporteure générale', office: 'Commission des finances' }))
        // promises.push(ExtraPosition.create({ deputyId: 82, position: 'Rapporteur général', office: 'Commission de la bienveillance' }))
        // promises.push(ExtraPosition.create({ deputyId: 9, position: 'Président', office: 'Office parlementaire d\'évaluation des choix scientifiques et technologiques' }))
        // promises.push(ExtraPosition.create({ deputyId: 91, position: 'Président', office: 'Office parlementaire d\'évaluation des choix scientifiques et technologiques' }))

        Promise.all(promises)
        .then(function() {
            done();
        })
    });

    it('should return regular deputy salary - no roles', function(done) {
        let salary = SalaryHelper.calculateSalary(null)
        salary.should.equal(5782)
        done();
    });

    it('should return regular deputy salary - empty roles', function(done) {
        let salary = SalaryHelper.calculateSalary([])
        salary.should.equal(5782)
        done();
    });

    it('should return regular deputy salary - no positions', function(done) {
        let deputyInstancesAndRoles = [ { instanceType: 'Bureau', positions: null } ]
        let salary = SalaryHelper.calculateSalary(deputyInstancesAndRoles)
        salary.should.equal(5782)
        done();
    });

    it('should return president salary - female', function(done) {
        let deputyInstancesAndRoles = getSimpleRole('Bureau', 'Présidente')
        let salary = SalaryHelper.calculateSalary(deputyInstancesAndRoles)
        salary.should.equal(11610)
        done();
    });

    it('should return president salary - male', function(done) {
        let deputyInstancesAndRoles = getSimpleRole('Bureau', 'Président')
        let salary = SalaryHelper.calculateSalary(deputyInstancesAndRoles)
        salary.should.equal(11610)
        done();
    });

    it('should return questeur salary - female', function(done) {
        let deputyInstancesAndRoles = getSimpleRole('Bureau', 'Questeur')
        let salary = SalaryHelper.calculateSalary(deputyInstancesAndRoles)
        salary.should.equal(9795)
        done();
    });

    it('should return questeur salary - male', function(done) {
        let deputyInstancesAndRoles = getSimpleRole('Bureau', 'Questeure')
        let salary = SalaryHelper.calculateSalary(deputyInstancesAndRoles)
        salary.should.equal(9795)
        done();
    });

    it('should return secretary salary', function(done) {
        let deputyInstancesAndRoles = getSimpleRole('Bureau', 'Secrétaire')
        let salary = SalaryHelper.calculateSalary(deputyInstancesAndRoles)
        salary.should.equal(6337)
        done();
    });

    it('should return commission general reporter salary - female', function(done) {
        let deputyInstancesAndRoles = getSimpleRole('Commission permanente', 'Rapporteure générale')
        let salary = SalaryHelper.calculateSalary(deputyInstancesAndRoles)
        salary.should.equal(6488)
        done();
    });

    it('should return commission general reporter salary - male', function(done) {
        let deputyInstancesAndRoles = getSimpleRole('Commission permanente', 'Rapporteur général')
        let salary = SalaryHelper.calculateSalary(deputyInstancesAndRoles)
        salary.should.equal(6488)
        done();
    });

    it('should return commission president salary - female', function(done) {
        let deputyInstancesAndRoles = getSimpleRole('Commission permanente', 'Présidente')
        let salary = SalaryHelper.calculateSalary(deputyInstancesAndRoles)
        salary.should.equal(6488)
        done();
    });

    it('should return commission president salary - male', function(done) {
        let deputyInstancesAndRoles = getSimpleRole('Commission permanente', 'Président')
        let salary = SalaryHelper.calculateSalary(deputyInstancesAndRoles)
        salary.should.equal(6488)
        done();
    });

    it('should return non permanent commission president salary - female', function(done) {
        let deputyInstancesAndRoles = getSimpleRole('Commission non permanente', 'Présidente', [ 'Commission spéciale chargée de vérifier et d\'apurer les comptes' ])
        let salary = SalaryHelper.calculateSalary(deputyInstancesAndRoles)
        salary.should.equal(6488)
        done();
    });

    it('should return non permanent commission president salary - male', function(done) {
        let deputyInstancesAndRoles = getSimpleRole('Commission non permanente', 'Président', [ 'Commission spéciale chargée de vérifier et d\'apurer les comptes' ])
        let salary = SalaryHelper.calculateSalary(deputyInstancesAndRoles)
        salary.should.equal(6488)
        done();
    });

    it('should return office president salary - female', function(done) {
        let deputyInstancesAndRoles = getSimpleRole('Délégation et Office', 'Présidente', [ 'Office parlementaire d\'évaluation des choix scientifiques et technologiques' ])
        let salary = SalaryHelper.calculateSalary(deputyInstancesAndRoles)
        salary.should.equal(6488)
        done();
    });

    it('should return office president salary - male', function(done) {
        let deputyInstancesAndRoles = getSimpleRole('Délégation et Office', 'Président', [ 'Office parlementaire d\'évaluation des choix scientifiques et technologiques' ])
        let salary = SalaryHelper.calculateSalary(deputyInstancesAndRoles)
        salary.should.equal(6488)
        done();
    });

    it('should return permanent commission and bureau secretary salary', function(done) {
        let deputyInstancesAndRoles = [
            {
                instanceType: 'Commission permanente',
                positions: [{
                    name: 'Président'
                }]
            },
            {
                instanceType: 'Bureau',
                positions: [{
                    name: 'Secrétaire'
                }]
            }
        ]
        let salary = SalaryHelper.calculateSalary(deputyInstancesAndRoles)
        salary.should.equal(7043)
        done();
    });

    it('should return bureau president and secretary salary', function(done) {
        let deputyInstancesAndRoles = [
            {
                instanceType: 'Bureau',
                positions: [{
                    name: 'Président'
                }]
            },
            {
                instanceType: 'Bureau',
                positions: [{
                    name: 'Secrétaire'
                }]
            }
        ]
        let salary = SalaryHelper.calculateSalary(deputyInstancesAndRoles)
        salary.should.equal(12165)
        done();
    });
});

let getSimpleRole = function(instanceName, positionName, instances) {
    return [{
        instanceType: instanceName,
        positions: [{
            name: positionName,
            instances: instances
        }]
    }]
}
