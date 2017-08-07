var Promise = require("bluebird");
var ResponseHelper = require('./helpers/ResponseHelper.js');

const BALLOTS_PAGE_ITEMS_COUNT = 30;

const BALLOT_TYPE_SOLEMN = "SSO";

var self = module.exports = {
    findBallots: function(page) {
        var offset = BALLOTS_PAGE_ITEMS_COUNT * page;
        return findBallotsWithOffset(offset);
    },

    getBallotWithId: function(id) {
        return Ballot.findOne({ id: id })
        .then(function(ballot) {
            if (ballot) {
                return VoteService.findVotesWithValueForBallot(ballot.id, "non-voting")
                .then(function(nonVoting) {
                    ballot.nonVoting = nonVoting.length;
                    return ResponseHelper.prepareBallotResponse(ballot);
                })
            } else {
                return;
            }
        })
    },

    getBallotWithIdAndDeputyVote: function(id, departmentId, district) {
        return self.getBallotWithId(id)
        .then(function(ballot) {
            if (ballot) {
                return getBallotWithDeputyVote(ballot, departmentId, district)
            } else {
                return;
            }
        })
    },

    findBallotsFromDate: function(searchedDate, solemnOnly) {
        var options = solemnOnly
        ? { date: { '>': searchedDate }, type: BALLOT_TYPE_SOLEMN }
        : { date: { '>': searchedDate } };
        return Ballot.find()
        .where(options)
    },

    findBallotsBetweenDates: function(beforeDate, afterDate) {
        return Ballot.find()
        .where({ date: { '<=': beforeDate , '>': afterDate } })
    }
};

var findBallotsWithOffset = function(offset) {
    return Ballot.find()
    .limit(BALLOTS_PAGE_ITEMS_COUNT)
    .skip(offset)
    .then(function(ballots) {
        var simplifiedBallots = [];
        for (i in ballots) {
            simplifiedBallots.push(ResponseHelper.prepareSimplifiedBallotResponse(ballots[i]))
        }
        return simplifiedBallots;
    })
}


var getBallotWithDeputyVote = function(ballot, departmentId, district) {
	return DeputyService.findDeputyAtDateForDistrict(departmentId, district, ballot.date)
	.then(function(deputy) {
		if (deputy) {
			return VoteService.findVoteValueForDeputyAndBallot(deputy.officialId, ballot.id, ballot.type)
			.then(function(voteValue) {
				return ResponseHelper.createBallotDetailsResponse(ballot, deputy, voteValue);;
			})
		} else {
			return ballot;
		}
	})
}
