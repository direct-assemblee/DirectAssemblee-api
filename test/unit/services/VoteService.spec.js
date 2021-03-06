require('../../bootstrap.test');

let Promise = require('bluebird');

let createVotes = function() {
    let promises = [];
    promises.push(Vote.create({ value: 'for', ballotId: 12, deputyId: 23 }))
    promises.push(Vote.create({ value: 'against', ballotId: 14, deputyId: 23 }))
    promises.push(Vote.create({ value: 'against', ballotId: 14, deputyId: 22 }))
    return Promise.all(promises)
}

let rememberBallotIds = function() {
    return Ballot.findOne({ officialId: 12 })
    .then(function(firstBallot) {
        // firstBallotId = firstBallot.officialId;

        return Ballot.findOne({ officialId: 14 })
        .then(function(secondBallot) {
            // secondBallotId = secondBallot.officialId;
        })
    })
}

let createDeputiesAndBallots = function() {
    let promises = [];
    promises.push(Deputy.create({ officialId: 22, departmentId: 1, district: 1, currentMandateStartDate: '2016-06-18' }));
    promises.push(Deputy.create({ officialId: 23, departmentId: 1, district: 2, currentMandateStartDate: '2017-08-18' }))

    promises.push(Theme.create({ name: 'themeName', typeName: 'themeTypeName' }))
    return Promise.all(promises)
    .then(function() {
        return Theme.findOne({ name: 'themeName' })
        .then(function(theme) {
            let otherPromises = [];
            otherPromises.push(Ballot.create({ 'title': 'a title', 'officialId': 14, 'date': '2017-06-18', 'createdAt': '2017-06-18', 'type': 2, theme: theme.id }));
            otherPromises.push(Ballot.create({ 'title': 'another title', 'officialId': 12, 'date': '2017-06-15', 'createdAt': '2017-06-15', 'type': 1, theme: theme.id }));
            otherPromises.push(Ballot.create({ 'title': 'a third title', 'officialId': 1222, 'date': '2017-06-15', 'createdAt': '2017-06-15', 'type': 1, theme: theme.id }));
            return Promise.all(otherPromises);
        })
    });
}

describe('The VoteService', function () {
    before(function(done) {
        createDeputiesAndBallots()
        .then(function() {
            rememberBallotIds()
            .then(function() {
                createVotes()
                .then(function() {
                    done();
                })
            })
        })
    });

    after(function(done) {
        let promises = [];
        promises.push(Ballot.destroy({}))
        promises.push(Deputy.destroy({}))
        promises.push(Vote.destroy({}))
        promises.push(Theme.destroy({}))
        Promise.all(promises)
        .then(function() {
            done();
        })
    });

    it('should return deputy votes ballot ids', function(done) {
        VoteService.findVotesBallotIds(23)
        .then(function(ballotsIds) {
            should.exist(ballotsIds);
            ballotsIds.length.should.equal(2);
            parseInt(ballotsIds[0]).should.equal(12);
            parseInt(ballotsIds[1]).should.equal(14);
            done();
        })
        .catch(done);
    });

    it('should return no deputy votes ballot ids - wrong deputy', function(done) {
        VoteService.findVotesBallotIds(2)
        .then(function(ballotsIds) {
            should.exist(ballotsIds);
            ballotsIds.length.should.equal(0);
            done();
        })
        .catch(done);
    });

    it('should return vote value for deputy and ballot', function(done) {
        VoteService.findVoteForDeputyAndBallot(23, 14)
        .then(function(vote) {
            should.exist(vote);
            should.exist(vote.value);
            vote.value.should.equal('against');
            done();
        })
        .catch(done);
    });

    it('should return no vote value for deputy and ballot - wrong deputy', function(done) {
        VoteService.findVoteForDeputyAndBallot(1, 14)
        .then(function(vote) {
            should.not.exist(vote);
            done();
        })
        .catch(done);
    });

    it('should return no vote value for deputy and ballot - wrong ballot', function(done) {
        VoteService.findVoteForDeputyAndBallot(23, 16)
        .then(function(vote) {
            should.not.exist(vote);
            done();
        })
        .catch(done);
    });

    it('should return last votes by deputy', function(done) {
        Deputy.find()
        .then(function(deputies) {
            VoteService.findLastVotesByDeputy('2014-08-14', deputies)
            .then(function(votesByDeputy) {
                should.exist(votesByDeputy);
                votesByDeputy.length.should.equal(2);

                if (votesByDeputy[0].deputyId == 23) {
                    checkFirstDeputyActivities(votesByDeputy[0].activities);
                    checkSecondDeputyActivities(votesByDeputy[1].activities);
                } else if (votesByDeputy[1].deputyId == 23) {
                    checkSecondDeputyActivities(votesByDeputy[0].activities);
                    checkFirstDeputyActivities(votesByDeputy[1].activities);
                }
                done();
            })
            .catch(done);
        })
    });

    it('should return no last votes by deputy', function(done) {
        Deputy.find()
        .then(function(deputies) {
            VoteService.findLastVotesByDeputy('2017-12-14', deputies)
            .then(function(votesByDeputy) {
                should.not.exist(votesByDeputy);
                done();
            })
            .catch(done);
        })
    });
});

let checkFirstDeputyActivities = function(activities) {
    activities.length.should.equal(3);

    activities[1].title.should.equal('a title');
    activities[1].theme.should.equal('themeName');
    activities[1].ballotId.should.equal(14);
    should.not.exist(activities[1].deputyId);
    activities[1].value.should.equal('against');

    activities[0].title.should.equal('another title');
    activities[0].theme.should.equal('themeName');
    activities[0].ballotId.should.equal(12);
    should.not.exist(activities[0].deputyId);
    activities[0].value.should.equal('for');

    activities[2].title.should.equal('a third title');
    activities[2].theme.should.equal('themeName');
    activities[2].ballotId.should.be.above(0);
    should.not.exist(activities[2].deputyId);
    activities[2].value.should.equal('missing');
}

let checkSecondDeputyActivities = function(activities) {
    activities.length.should.equal(3);

    activities[1].title.should.equal('a title');
    activities[1].theme.should.equal('themeName');
    activities[1].ballotId.should.equal(14);
    should.not.exist(activities[1].deputyId);
    activities[1].value.should.equal('against');

    activities[0].title.should.equal('another title');
    activities[0].theme.should.equal('themeName');
    activities[0].ballotId.should.equal(12);
    should.not.exist(activities[0].deputyId);
    activities[0].value.should.equal('missing');

    activities[2].title.should.equal('a third title');
    activities[2].theme.should.equal('themeName');
    activities[2].ballotId.should.be.above(0);
    should.not.exist(activities[2].deputyId);
    activities[2].value.should.equal('missing');
}
