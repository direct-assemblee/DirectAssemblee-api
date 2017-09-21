require('../../bootstrap');
let moment = require('moment');

let fifthBallotCreatedId;
let ballotThemeCreatedId;

describe('The BallotService', function () {
    beforeEach(function(done) {
        let promises = [];
        Promise.all(promises)
        .then(function() {
            done();
        })
    });

    describe('pagination', function () {
        before(function(done) {
            let promises = [];
            promises = promises.concat(BallotTheme.create({ name: 'Education', typeName: 'EDUCATION' }));
            Promise.all(promises)
            .then(function() {
                BallotTheme.findOne({ name: 'Education' })
                .then(function(ballotTheme) {
                    ballotThemeCreatedId = ballotTheme.id;
                    createBallotsForFirstTests(done);
                })
            });
        });

        after(function(done) {
            let promises = [];
            promises.push(destroyBallots(37, 0));
            Promise.all(promises)
            .then(function() {
                done();
            })
            .catch(done);
        });

        it('should return 30 ballots in first page', function(done) {
            BallotService.findBallots(0)
            .then(function(ballots) {
                ballots.length.should.equal(30);
                done();
            })
            .catch(done);
        });

        it('should return 7 ballots in second page', function(done) {
            BallotService.findBallots(1)
            .then(function(ballots) {
                ballots.length.should.equal(7);
                done();
            })
            .catch(done);
        });

        it('should return all ballots from given date', function(done) {
            let date = moment('12/02/2017', 'DD/MM/YYYY').format('YYYY-MM-DD');
            BallotService.findBallotsFromDate(date)
            .then(function(ballots) {
                ballots.length.should.equal(10);
                done();
            })
        });

        it('should return only solemn ballots from given date', function(done) {
            let date = moment('12/02/2017', 'DD/MM/YYYY').format('YYYY-MM-DD');
            BallotService.findBallotsFromDate(date)
            .then(function(ballots) {
                ballots.length.should.equal(10);
                done();
            })
        });

        it('should return no ballot from given date', function(done) {
            let date = moment('12/02/2018', 'DD/MM/YYYY').format('YYYY-MM-DD');
            BallotService.findBallotsFromDate(date)
            .then(function(ballots) {
                ballots.length.should.equal(0);
                done();
            })
        });

        it('should return ballot with id', function(done) {
            BallotService.getBallotWithId(fifthBallotCreatedId)
            .then(function(ballot) {
                ballot.id.should.equal(fifthBallotCreatedId);
                ballot.officialId.should.equal('5');
                ballot.ballotThemeId.name.should.equal('Education');
                ballot.ballotThemeId.typeName.should.equal('EDUCATION');
                done();
            })
        });
    });
});

let createOneBallotADay = function(size, type, startingId) {
    let promises = [];
    let startingDate = moment('22/02/2017', 'DD/MM/YYYY');
    for (let i = 0 ; i < size ; i++) {
        let date = moment(startingDate).subtract(startingId + i, 'days').format('YYYY-MM-DD');
        // console.log('push : ' + (i+startingId) + " -- date " + date + ' -- type ' + type)
        promises.push(Ballot.create({ 'officialId': startingId + i, 'date': date, 'type': type, ballotThemeId: ballotThemeCreatedId }));
    }
    return promises;
}

let createBallotsForFirstTests = function(done) {
    let promises = [];
    promises = promises.concat(createOneBallotADay(10, 'SSO', 0));
    promises = promises.concat(createOneBallotADay(20, 'SOR', 10));
    promises = promises.concat(createOneBallotADay(7, 'SSO', 30));
    Promise.all(promises)
    .then(function() {
        Ballot.findOne({ 'officialId': 5 })
        .then(function(ballot) {
            fifthBallotCreatedId = ballot.id;
            done();
        })
    });
}

let destroyBallots = function(startingId, size) {
    let promises = [];
    for (let i = startingId ; i < size ; i++) {
        promises.push(Ballot.destroy({ 'officialId': i }));
    }
    return promises;
}
