let ResponseHelper = require('./helpers/ResponseHelper.js');

const BALLOTS_PAGE_ITEMS_COUNT = 30;
const BALLOT_TYPE_SOLEMN = 'SSO';

module.exports = {
    findBallotsFromDate: function(searchedDate) {
        return Ballot.find()
        .where({ date: { '>': searchedDate }})
    },

    findBallotsBetweenDates: function(beforeDate, afterDate) {
        return Ballot.find()
        .where({ date: { '<=': beforeDate , '>': afterDate } })
        .populate('type');
    },

    countBallotsForLaw: function(law) {
        return Ballot.count({ lawId: law.id })
    }
}
