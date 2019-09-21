let ResponseHelper = require('./helpers/ResponseHelper.js');

const BALLOTS_PAGE_ITEMS_COUNT = 30;
const BALLOT_TYPE_SOLEMN = 'SSO';

module.exports = {
    findBallotsForLaw: function(lawId) {
        return Ballot.find()
        .where({ lawId: lawId })
        .populate('type')
        .sort('officialId DESC')
    },

    findBallotsAfterDate: function(searchedDate) {
        return Ballot.find()
        .where({ date: { '>': searchedDate }})
    },

    findBallotsWithLawCreatedFromDate: function(searchedDate) {
        return Ballot.find()
        .where({ createdAt: { '>=': searchedDate }})
        .populate('lawId')
    },

    findUncategorizedBallotsBetweenDates: function(beforeDate, afterDate) {
        return Ballot.find()
        .where({ lawId: null, date: { '<=': beforeDate , '>=': afterDate } })
        .populate('type')
        .sort('officialId DESC')
    },

    countBallotsForLaw: function(law) {
        return Ballot.count({ lawId: law.id })
    }
}
