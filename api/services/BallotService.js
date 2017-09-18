let ResponseHelper = require('./helpers/ResponseHelper.js');
let Promise = require('bluebird');

const BALLOTS_PAGE_ITEMS_COUNT = 30;
const BALLOT_TYPE_SOLEMN = 'SSO';

let self = module.exports = {
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
        .populate('ballotThemeId')
    },

    getBallotWithId: function(id) {
        return Ballot.findOne({ id: id })
        .populate('ballotThemeId')
    },

    getBallotWithIdAndDeputyVote: function(id, departmentId, district) {
        return self.getBallotWithId(id)
        .then(function(ballot) {
            if (ballot) {
                return addBallotVoteForDistrict(ballot, departmentId, district);
            } else {
                return ;
            }
        })
    },

    getDetailedBallotsBetweenDates: function(deputy, beforeDate, afterDate) {
        return findBallotsBetweenDates(beforeDate, afterDate)
        .then(function(ballots) {
            if (ballots) {
                return Promise.map(ballots, function(ballot) {
                    return addBallotVoteForDeputy(ballot, deputy);
                }, {concurrency: 10})
            }
        })
    }
};

let addBallotVoteForDistrict = function(ballot, departmentId, district) {
    return DeputyService.findMostRecentDeputyAtDate(departmentId, district, ballot.date)
    .then(function(deputy) {
        return addBallotVoteForDeputy(ballot, deputy);
    })
}

let addBallotVoteForDeputy = function(ballot, deputy) {
    if (deputy) {
        return VoteService.findVotesWithValueForBallot(ballot.id, 'non-voting')
        .then(function(nonVoting) {
            ballot.nonVoting = nonVoting.length;
            return getBallotWithDeputyVote(ballot, deputy);
        })
    } else {
        return ballot;
    }
}

let findBallotsBetweenDates = function(beforeDate, afterDate) {
    return Ballot.find()
    .where({ date: { '<=': beforeDate , '>': afterDate } })
    .populate('ballotThemeId');
}

let findBallotsWithOffset = function(offset) {
    return Ballot.find()
    .populate('ballotThemeId')
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

let getBallotWithDeputyVote = function(ballot, deputy) {
    if (deputy) {
        return VoteService.findVoteValueForDeputyAndBallot(deputy.officialId, ballot.id, ballot.type)
        .then(function(voteValue) {
            return ResponseHelper.createBallotDetailsResponse(ballot, deputy, voteValue);
        })
    } else {
        return ballot;
    }
}
