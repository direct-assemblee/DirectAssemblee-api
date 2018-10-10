require('../../bootstrap.test');
let Promise = require('bluebird');

let StubsBuilder = require('../../fixtures/StubsBuilder');
let ActivityRateService;

describe('The ActivityRateService', function () {
    before(function(done) {
        let stubs = {
            './DeputyService.js': StubsBuilder.buildDeputyServiceStub(true, true)
        }
        ActivityRateService = StubsBuilder.buildStub('services/ActivityRateService', stubs);
        done()
    });

    it('should return activity rates by groups sorted from highest to lowest', function(done) {
        ActivityRateService.getSortedActivityRatesByParliamentGroup()
        .then(function(activityRatesByGroup) {
            should.exist(activityRatesByGroup);
            activityRatesByGroup.length.should.equal(3);
            activityRatesByGroup[0].group.id.should.equal(2)
            activityRatesByGroup[0].group.name.should.equal('La FI')
            activityRatesByGroup[0].activityRate = 20
            activityRatesByGroup[1].group.id.should.equal(1)
            activityRatesByGroup[1].group.name.should.equal('La REM')
            activityRatesByGroup[1].activityRate = 15
            activityRatesByGroup[2].group.id.should.equal(0)
            activityRatesByGroup[2].group.name.should.equal('Non-inscrits')
            activityRatesByGroup[2].activityRate = 5
            done();
        })
        .catch(done);
    });
});
