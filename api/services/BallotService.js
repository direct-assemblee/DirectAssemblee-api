let ResponseHelper = require('./helpers/ResponseHelper.js');

const BALLOTS_PAGE_ITEMS_COUNT = 30;
const BALLOT_TYPE_SOLEMN = 'SSO';

module.exports = {
    findBallots: function(page) {
        let offset = BALLOTS_PAGE_ITEMS_COUNT * page;
        return findBallotsWithOffset(offset);
    },

    findBallotsFromDate: function(searchedDate, solemnOnly) {
        let options = solemnOnly
        ? { date: { '>': searchedDate }, type: BALLOT_TYPE_SOLEMN }
        : { date: { '>': searchedDate } };
        return Ballot.find()
        .where(options)
        .populate('themeId')
    },

    getBallotWithId: function(id) {
        return Ballot.findOne({ officialId: id })
        .populate('themeId')
    },

    findBallotsBetweenDates: function(beforeDate, afterDate) {
        return Ballot.find()
        .where({ date: { '<=': beforeDate , '>': afterDate } })
        .populate('themeId');
    }
}

let findBallotsWithOffset = function(offset) {
    return Ballot.find()
    .populate('themeId')
    .limit(BALLOTS_PAGE_ITEMS_COUNT)
    .skip(offset)
    .then(function(ballots) {
        let simplifiedBallots = [];
        for (let i in ballots) {
            simplifiedBallots.push(ResponseHelper.prepareSimplifiedBallotResponse(ballots[i]))
        }
        return simplifiedBallots;
    })
}
