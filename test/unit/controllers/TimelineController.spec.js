require('../../bootstrap');

let StubsBuilder = require('../../fixtures/StubsBuilder');

describe('The DeputyController has a valid deputy', function () {

    describe('Invalid deputy', function () {
        it('should return error message with 404 - no deputy', function(done) {
            let stubs = {
                '../services/DeputyService.js': StubsBuilder.buildDeputyServiceStub(false, false),
            }
            let TimelineController = StubsBuilder.buildClassWithStubs('controllers/TimelineController', stubs);

            TimelineController.getTimelineForDeputy(14)
            .then(function(response) {
                should.exist(response);
                response.code.should.equal(404);
                response.message.should.equal('No deputy found with id : 14');
                done();
            })
            .catch(done);
        })

        it('should return error message with 404 - deputy mandate has ended', function(done) {
            let stubs = {
                '../services/DeputyService.js': StubsBuilder.buildDeputyServiceStub(true, false),
            }
            let TimelineController = StubsBuilder.buildClassWithStubs('controllers/TimelineController', stubs);

            TimelineController.getTimelineForDeputy(14)
            .then(function(response) {
                should.exist(response);
                response.code.should.equal(404);
                response.message.should.equal('Mandate has ended for deputy with id : 14');
                done();
            })
            .catch(done);
        })
    })

    describe('Valid deputy', function () {
        it('should return empty timeline', function(done) {
            let stubs = {
                '../services/DeputyService.js': StubsBuilder.buildDeputyServiceStub(true, true)
            }
            let TimelineController = StubsBuilder.buildClassWithStubs('controllers/TimelineController', stubs);

            TimelineController.getTimelineForDeputy(14)
            .then(function(result) {
                should.exist(result);
                result.code.should.equal(200);
                result.response.length.should.equal(0);
                done();
            })
            .catch(done);
        })

        it('should return correct timeline', function(done) {
            let stubs = {
                '../services/DeputyService.js': StubsBuilder.buildDeputyServiceStub(true, true),
                '../services/TimelineService.js': StubsBuilder.buildTimelineServiceStub()
            }
            let TimelineController = StubsBuilder.buildClassWithStubs('controllers/TimelineController', stubs);

            TimelineController.getTimelineForDeputy(14)
            .then(function(result) {
                should.exist(result);
                result.code.should.equal(200);
                result.response.length.should.equal(1);

                let ballot = result.response[0];
                ballot.date.should.equal('01/08/2017');
                ballot.description.should.equal('scrutin description');
                ballot.title.should.equal('Scrutin ordinaire');
                ballot.type.should.equal('vote_ordinary');
                should.exist(ballot.theme);
                ballot.theme.id.should.equal(29);
                ballot.theme.name.should.equal('Travail');
                ballot.fileUrl.should.equal('http://www.assemblee-nationale.fr/15/dossiers/habilitation_ordonnances_dialogue_social.asp');
                should.exist(ballot.extraBallotInfo);
                ballot.extraBallotInfo.id.should.equal(34);
                ballot.extraBallotInfo.totalVotes.should.equal(302);
                ballot.extraBallotInfo.yesVotes.should.equal(36);
                ballot.extraBallotInfo.noVotes.should.equal(256);
                ballot.extraBallotInfo.nonVoting.should.equal(1);
                ballot.extraBallotInfo.blankVotes.should.equal(10);
                ballot.extraBallotInfo.missing.should.equal(274);
                ballot.extraBallotInfo.isAdopted.should.equal(false);
                should.exist(ballot.extraBallotInfo.deputyVote);
                ballot.extraBallotInfo.deputyVote.voteValue.should.equal('missing');
                should.exist(ballot.extraBallotInfo.deputyVote.deputy);
                ballot.extraBallotInfo.deputyVote.deputy.firstname.should.equal('JM');
                ballot.extraBallotInfo.deputyVote.deputy.lastname.should.equal('Député');
                done();
            })
            .catch(done);
        })
    })
});
