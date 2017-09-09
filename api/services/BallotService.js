let ResponseHelper = require('./helpers/ResponseHelper.js');

const BALLOTS_PAGE_ITEMS_COUNT = 30;
const BALLOT_TYPE_SOLEMN = 'SSO';

let self = module.exports = {
    findBallots: function(page) {
        let offset = BALLOTS_PAGE_ITEMS_COUNT * page;
        return findBallotsWithOffset(offset);
    },

    getBallotWithId: function(id) {
        return Ballot.findOne({ id: id })
        .then(function(ballot) {
            if (ballot) {
                ballot.type = 'motion_of_censure';
                return VoteService.findVotesWithValueForBallot(ballot.id, 'non-voting')
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
        let options = solemnOnly
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

let findBallotsWithOffset = function(offset) {
    return Ballot.find()
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


let getBallotWithDeputyVote = function(ballot, departmentId, district) {
	return DeputyService.findDeputyAtDateForDistrict(departmentId, district, ballot.date)
	.then(function(deputy) {
		if (deputy) {
			return VoteService.findVoteValueForDeputyAndBallot(deputy.officialId, ballot.id, ballot.type)
			.then(function(voteValue) {
				return ResponseHelper.createBallotDetailsResponse(ballot, deputy, voteValue);
			})
		} else {
			return ballot;
		}
	})
}
