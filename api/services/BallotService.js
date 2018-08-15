let ResponseHelper = require('./helpers/ResponseHelper.js');

const BALLOTS_PAGE_ITEMS_COUNT = 30;
const BALLOT_TYPE_SOLEMN = 'SSO';

module.exports = {
    findBallotsFromDate: function(searchedDate, solemnOnly) {
        let options = solemnOnly
        ? { date: { '>': searchedDate }, type: BALLOT_TYPE_SOLEMN }
        : { date: { '>': searchedDate } };
        return Ballot.find()
        .where(options)
        .populate('themeId')
    },

    findBallotsBetweenDates: function(beforeDate, afterDate) {
        return Ballot.find()
        .where({ date: { '<=': beforeDate , '>': afterDate } })
        .populate('themeId')
        .populate('type');
    }
}
