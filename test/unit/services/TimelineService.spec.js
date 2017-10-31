require('../../bootstrap.test');

let StubsBuilder = require('../../fixtures/StubsBuilder');
let MocksBuilder = require('../../fixtures/MocksBuilder');

let TimelineService;

describe('The TimelineService', function() {
    describe('getTimeline() of a deputy with no works or ballots', function() {
        before(function() {
            let stubs = {
                './BallotService.js': StubsBuilder.buildBallotServiceStub(0),
                './WorkService.js': StubsBuilder.buildWorkServiceStub(0),
            }
            TimelineService = StubsBuilder.buildClassWithStubs('services/TimelineService', stubs);
        })

        it('should return empty timeline', function(done) {
            let deputy = MocksBuilder.buildDeputy(true, true, 12, 4);
            TimelineService.getTimeline(deputy, 0)
            .then(function(result) {
                should.exist(result);
                result.length.should.equal(0);
                done();
            })
            .catch(done);
        })
    })


});
