let ResponseHelper = require('./helpers/ResponseHelper.js');

const BALLOTS_PAGE_ITEMS_COUNT = 30;
const BALLOT_TYPE_SOLEMN = 'SSO';

module.exports = {
    findLawsFromDate: function(searchedDate) {
        return Law.find()
        .where({ lastBallotDate: { '>': searchedDate }})
    },

    findLawsAndBallotsCountBetweenDates: function(beforeDate, afterDate) {
        return findLawsBetweenDates(beforeDate, afterDate)
        .then(laws => {
            let promises = [];
            for (let i in laws) {
                promises.push(addBallotsCountToLaw(laws[i]));
            }
            return Promise.all(promises)
        })
    }
}

let addBallotsCountToLaw = function(law) {
    return BallotService.countBallotsForLaw(law)
    .then(count => {
        law.ballotsCount = count;
        return law;
    })
}

let findLawsBetweenDates = function(beforeDate, afterDate) {
    return Law.find()
    .where({ lastBallotDate: { '<=': beforeDate , '>': afterDate }});
}
