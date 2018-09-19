require('../../bootstrap.test');
let moment = require('moment');

let themeCreatedId;

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
            promises = promises.concat(Theme.create({ name: 'Education', typeName: 'EDUCATION' }));
            Promise.all(promises)
            .then(function() {
                Theme.findOne({ name: 'Education' })
                .then(function(theme) {
                    themeCreatedId = theme.id;
                    createBallotsForFirstTests(done);
                })
            });
        });

        after(function(done) {
            let promises = [];
            promises.push(Ballot.destroy({}));
            promises.push(Theme.destroy({}));
            Promise.all(promises)
            .then(function() {
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
    });
});

let createOneBallotADay = function(size, type, startingId) {
    let promises = [];
    let startingDate = moment('22/02/2017', 'DD/MM/YYYY');
    for (let i = 0 ; i < size ; i++) {
        let date = moment(startingDate).subtract(startingId + i - 1, 'days').format('YYYY-MM-DD');
        // console.log('push : ' + (i+startingId) + " -- date " + date + ' -- type ' + type)
        promises.push(Ballot.create({ 'officialId': startingId + i, 'date': date, 'type': type, theme: themeCreatedId }));
    }
    return promises;
}

let createBallotsForFirstTests = function(done) {
    let promises = [];
    promises = promises.concat(createOneBallotADay(10, 2, 1));
    promises = promises.concat(createOneBallotADay(20, 1, 15));
    promises = promises.concat(createOneBallotADay(7, 2, 40));
    Promise.all(promises)
    .then(function() {
        // Ballot.findOne({ 'officialId': 5 })
        // .then(function(ballot) {
            done();
        // })
    });
}
