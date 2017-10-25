require('../../bootstrap');

let StubsBuilder = require('../../fixtures/StubsBuilder');
let DeputyController;

describe('The DeputyController has a valid deputy', function () {

    describe('Valid deputy', function () {
        before(function() {
            let stubs = {
                '../services/DepartmentService.js': StubsBuilder.buildDepartmentServiceStub(),
                '../services/DeclarationService.js': StubsBuilder.buildDeclarationServiceStub(),
                '../services/MandateService.js': StubsBuilder.buildMandateServiceStub(),
                '../services/BallotService.js': StubsBuilder.buildBallotServiceStub(),
                '../services/VoteService.js': StubsBuilder.buildVoteServiceStub(),
                '../services/WorkService.js': StubsBuilder.buildWorkServiceStub(),
                '../services/helpers/DateHelper.js': StubsBuilder.buildDateHelperStub(),
                '../services/DeputyService.js': StubsBuilder.buildDeputyServiceStub(true, true),
                '../services/ExtraPositionService.js': StubsBuilder.buildExtraPositionServiceStub()
            }
            DeputyController = StubsBuilder.buildClassWithStubs('controllers/DeputyController', stubs);
        }),

        it('should return deputy with given departmentId and district', function(done) {
            DeputyController.getDeputyWithDistrict(1, 1)
            .then(function(deputyResponse) {
                should.exist(deputyResponse);
                deputyResponse.code.should.equal(200);
                deputyResponse.response.id.should.equal(14);
                deputyResponse.response.seatNumber.should.equal(44);
                deputyResponse.response.department.id.should.equal(1);
                deputyResponse.response.district.should.equal(1);
                deputyResponse.response.photoUrl.should.equal('http://www2.assemblee-nationale.fr/static/tribun/15/photos/14.jpg');
                deputyResponse.response.age.should.equal(20);
                deputyResponse.response.parliamentAgeInMonths.should.equal(10);
                deputyResponse.response.activityRate.should.equal(50);
                deputyResponse.response.salary.should.equal(7200);
                deputyResponse.response.currentMandateStartDate.should.equal('18/06/2016');

                should.exist(deputyResponse.response.declarations);
                deputyResponse.response.declarations.length.should.equal(2);
                deputyResponse.response.declarations[0].title.should.equal('Jolie decla');
                deputyResponse.response.declarations[0].url.should.equal('http://jolieurl');
                deputyResponse.response.declarations[0].date.should.equal('22/12/2016');
                should.not.exist(deputyResponse.response.declarations[0].createdId);
                should.not.exist(deputyResponse.response.declarations[0].updatedAt);
                should.not.exist(deputyResponse.response.declarations[0].id);
                should.not.exist(deputyResponse.response.declarations[0].deputyId);
                deputyResponse.response.declarations[1].title.should.equal('Jolie decla 2');
                deputyResponse.response.declarations[1].url.should.equal('http://jolieurl2');
                deputyResponse.response.declarations[1].date.should.equal('13/01/2016');
                should.not.exist(deputyResponse.response.declarations[1].deputyId);
                should.not.exist(deputyResponse.response.declarations[1].createdId);
                should.not.exist(deputyResponse.response.declarations[1].updatedAt);
                should.not.exist(deputyResponse.response.declarations[1].id);

                should.not.exist(deputyResponse.response.birthDate);
                should.not.exist(deputyResponse.response.department.slug);
                should.not.exist(deputyResponse.response.department.soundexName);
                should.not.exist(deputyResponse.response.department.nameUppercase);
                should.not.exist(deputyResponse.response.departmentId);
                should.not.exist(deputyResponse.response.officialId);
                should.not.exist(deputyResponse.response.gender);
                should.not.exist(deputyResponse.response.createdAt);
                should.not.exist(deputyResponse.response.updatedAt);
                should.not.exist(deputyResponse.response.mandateEndDate);
                should.not.exist(deputyResponse.response.mandateEndReason);
                done();
            })
            .catch(done);
        });
    }),

    describe('Invalid deputy', function () {
        before(function() {
            let stubs = {
                '../services/DepartmentService.js': StubsBuilder.buildDepartmentServiceStub(),
                '../services/DeclarationService.js': StubsBuilder.buildDeclarationServiceStub(),
                '../services/MandateService.js': StubsBuilder.buildMandateServiceStub(),
                '../services/BallotService.js': StubsBuilder.buildBallotServiceStub(),
                '../services/VoteService.js': StubsBuilder.buildVoteServiceStub(),
                '../services/WorkService.js': StubsBuilder.buildWorkServiceStub(),
                '../services/helpers/DateHelper.js': StubsBuilder.buildDateHelperStub(),
                '../services/DeputyService.js': StubsBuilder.buildDeputyServiceStub(false, false),
                '../services/ExtraPositionService.js': StubsBuilder.buildExtraPositionServiceStub()
            }
            DeputyController = StubsBuilder.buildClassWithStubs('controllers/DeputyController', stubs);
        }),

        it('should return no deputy with given departmentId and district', function(done) {
            DeputyController.getDeputyWithDistrict(10, 1)
            .then(function(deputyResponse) {
                should.exist(deputyResponse);
                deputyResponse.code.should.equal(404);
                deputyResponse.message.should.equal('Could not find deputy, sorry.');
                done();
            })
            .catch(done);
        })
    })
});
