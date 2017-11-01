require('../../bootstrap.test');

let StubsBuilder = require('../../fixtures/StubsBuilder');
let DeputyController;

describe('The DeputyController ', function() {
    describe('getDeputies function', function() {
        describe('called with wrong input', function () {
            before(function() {
                DeputyController = StubsBuilder.buildClassWithStubs('controllers/DeputyController', []);
            })

            it('should return 400 error with bad param - when latitude is undefined', function(done) {
                DeputyController.getDeputies()
                .then(function(response) {
                    should.exist(response);
                    response.code.should.equal(400);
                    response.content.should.equal('Must provide latitude and longitude arguments');
                    done();
                })
                .catch(done);
            })

            it('should return 400 error with bad param - when longitude is undefined', function(done) {
                DeputyController.getDeputies(4)
                .then(function(response) {
                    should.exist(response);
                    response.code.should.equal(400);
                    response.content.should.equal('Must provide latitude and longitude arguments');
                    done();
                })
                .catch(done);
            })
        }),

        describe('called with correct input but out of map', function() {
            before(function() {
                let stubs = {
                    '../services/GeolocService.js': StubsBuilder.buildGeolocServiceStub(0)
                }
                DeputyController = StubsBuilder.buildClassWithStubs('controllers/DeputyController', stubs);
            })

            it('should return 404 error - no deputies found', function(done) {
                DeputyController.getDeputies(3, 44)
                .then(function(response) {
                    should.exist(response);
                    response.code.should.equal(404);
                    response.content.should.equal('Sorry, no district found');
                    done();
                })
                .catch(done);
            })
        })

        describe('called with correct input in map', function() {
            before(function() {
                let stubs = {
                    '../services/GeolocService.js': StubsBuilder.buildGeolocServiceStub(2),
                    '../services/DeputyService.js': StubsBuilder.buildDeputyServiceStub(true, true),
                    '../services/DepartmentService.js': StubsBuilder.buildDepartmentServiceStub(true, true)
                }
                DeputyController = StubsBuilder.buildClassWithStubs('controllers/DeputyController', stubs);
            })

            it('should return deputies', function(done) {
                DeputyController.getDeputies(3, 44)
                .then(function(response) {
                    should.exist(response);
                    response.code.should.equal(200);
                    let content = response.content;
                    content.length.should.equal(2);

                    verifyDeputySimpleResponse(content[0], 34, 6);
                    verifyDeputySimpleResponse(content[1], 32, 5);

                    done();
                })
                .catch(done);
            })
        })
    })

    describe('getDeputy function', function() {
        describe('called with correct input', function() {
            before(function() {
                let stubs = {
                    '../services/DepartmentService.js': StubsBuilder.buildDepartmentServiceStub(),
                    '../services/DeclarationService.js': StubsBuilder.buildDeclarationServiceStub(),
                    '../services/MandateService.js': StubsBuilder.buildMandateServiceStub(),
                    '../services/BallotService.js': StubsBuilder.buildBallotServiceStub(4),
                    '../services/VoteService.js': StubsBuilder.buildVoteServiceStub(),
                    '../services/WorkService.js': StubsBuilder.buildWorkServiceStub(2),
                    '../services/helpers/DateHelper.js': StubsBuilder.buildDateHelperStub(),
                    '../services/DeputyService.js': StubsBuilder.buildDeputyServiceStub(true, true),
                    '../services/ExtraPositionService.js': StubsBuilder.buildExtraPositionServiceStub()
                }
                DeputyController = StubsBuilder.buildClassWithStubs('controllers/DeputyController', stubs);
            }),

            it('should return deputy with given departmentId and district', function(done) {
                DeputyController.getDeputy(1, 1)
                .then(function(response) {
                    should.exist(response);
                    response.code.should.equal(200);

                    verifyDeputyFullResponse(response.content);

                    done();
                })
                .catch(done);
            });
        }),

        describe('called with correct input but out of map', function() {
            before(function() {
                let stubs = {
                    '../services/helpers/DateHelper.js': StubsBuilder.buildDateHelperStub(),
                    '../services/DeputyService.js': StubsBuilder.buildDeputyServiceStub(false, false)
                }
                DeputyController = StubsBuilder.buildClassWithStubs('controllers/DeputyController', stubs);
            }),

            it('should return no deputy with given departmentId and district', function(done) {
                DeputyController.getDeputy(10, 1)
                .then(function(deputyResponse) {
                    should.exist(deputyResponse);
                    deputyResponse.code.should.equal(404);
                    deputyResponse.content.should.equal('Could not find deputy, sorry.');
                    done();
                })
                .catch(done);
            })
        }),

        describe('called with correct input but deputy\'s mandate has ended', function() {
            before(function() {
                let stubs = {
                    '../services/helpers/DateHelper.js': StubsBuilder.buildDateHelperStub(),
                    '../services/DeputyService.js': StubsBuilder.buildDeputyServiceStub(true, false)
                }
                DeputyController = StubsBuilder.buildClassWithStubs('controllers/DeputyController', stubs);
            }),

            it('should return no deputy with given departmentId and district', function(done) {
                DeputyController.getDeputy(10, 1)
                .then(function(deputyResponse) {
                    should.exist(deputyResponse);
                    deputyResponse.code.should.equal(404);
                    deputyResponse.content.should.equal('Found deputy, but mandate has ended.');
                    done();
                })
                .catch(done);
            })
        }),

        describe('called with wrong input', function() {
            before(function() {
                DeputyController = StubsBuilder.buildClassWithStubs('controllers/DeputyController', {});
            }),

            it('should return 400 bad param error - no department param', function(done) {
                DeputyController.getDeputy()
                .then(function(deputyResponse) {
                    should.exist(deputyResponse);
                    deputyResponse.code.should.equal(400);
                    deputyResponse.content.should.equal('Must provide departmentId and district arguments');
                    done();
                })
                .catch(done);
            })

            it('should return 400 bad param error - no district param', function(done) {
                DeputyController.getDeputy(1)
                .then(function(deputyResponse) {
                    should.exist(deputyResponse);
                    deputyResponse.code.should.equal(400);
                    deputyResponse.content.should.equal('Must provide departmentId and district arguments');
                    done();
                })
                .catch(done);
            })
        })
    })
});

let verifyDeputyFullResponse = function(deputy) {
    deputy.id.should.equal(14);
    deputy.seatNumber.should.equal(44);
    deputy.department.id.should.equal(1);
    deputy.district.should.equal(1);
    deputy.photoUrl.should.equal('http://www2.assemblee-nationale.fr/static/tribun/15/photos/14.jpg');
    deputy.age.should.equal(20);
    deputy.parliamentAgeInMonths.should.equal(10);
    deputy.activityRate.should.equal(50);
    deputy.salary.should.equal(7200);
    deputy.currentMandateStartDate.should.equal('18/06/2016');


    let declarations = deputy.declarations;
    should.exist(declarations);
    declarations.length.should.equal(2);
    declarations[0].title.should.equal('Jolie decla');
    declarations[0].url.should.equal('http://jolieurl');
    declarations[0].date.should.equal('22/12/2016');
    declarations[1].title.should.equal('Jolie decla 2');
    declarations[1].url.should.equal('http://jolieurl2');
    declarations[1].date.should.equal('13/01/2016');

    verifyDeputyFieldsAreDeletedForFullResponse(deputy);
}

let verifyDeputyFieldsAreDeletedForFullResponse = function(deputy) {
    should.not.exist(deputy.birthDate);
    should.not.exist(deputy.department.slug);
    should.not.exist(deputy.department.soundexName);
    should.not.exist(deputy.department.nameUppercase);
    should.not.exist(deputy.departmentId);
    should.not.exist(deputy.officialId);
    should.not.exist(deputy.gender);
    should.not.exist(deputy.createdAt);
    should.not.exist(deputy.updatedAt);
    should.not.exist(deputy.mandateEndDate);
    should.not.exist(deputy.mandateEndReason);

    let declarations = deputy.declarations;
    should.not.exist(declarations[0].createdId);
    should.not.exist(declarations[0].updatedAt);
    should.not.exist(declarations[0].id);
    should.not.exist(declarations[0].deputyId);
    should.not.exist(declarations[1].deputyId);
    should.not.exist(declarations[1].createdId);
    should.not.exist(declarations[1].updatedAt);
    should.not.exist(declarations[1].id);
}

let verifyDeputySimpleResponse = function(deputy, departmentCode, district) {
    deputy.id.should.equal(14);
    deputy.firstname.should.equal('JM');
    deputy.lastname.should.equal('Député');
    deputy.parliamentGroup.should.equal('FI');
    deputy.seatNumber.should.equal(44);
    deputy.photoUrl.should.equal('http://www2.assemblee-nationale.fr/static/tribun/15/photos/14.jpg');

    deputy.district.should.equal(district);
    deputy.department.id.should.equal(12);
    deputy.department.code.should.equal(departmentCode);
    deputy.department.name.should.equal('fakeDepartment');

    verifyDeputyFieldsAreDeletedForSimpleResponse(deputy);
}

let verifyDeputyFieldsAreDeletedForSimpleResponse = function(deputy) {
    should.not.exist(deputy.officialId);
    should.not.exist(deputy.birthDate);
    should.not.exist(deputy.department.slug);
    should.not.exist(deputy.department.soundexName);
    should.not.exist(deputy.department.nameUppercase);
    should.not.exist(deputy.departmentId);
    should.not.exist(deputy.officialId);
    should.not.exist(deputy.gender);
    should.not.exist(deputy.createdAt);
    should.not.exist(deputy.updatedAt);
    should.not.exist(deputy.mandateEndDate);
    should.not.exist(deputy.mandateEndReason);
    should.not.exist(deputy.commission);
    should.not.exist(deputy.phone);
    should.not.exist(deputy.email);
    should.not.exist(deputy.currentMandateStartDate);
    should.not.exist(deputy.job);
    should.not.exist(deputy.age);
}
