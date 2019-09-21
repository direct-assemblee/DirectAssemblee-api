let Promise = require('bluebird');
let ResponseHelper = require('./helpers/ResponseHelper.js');
let DateHelper = require('./helpers/DateHelper.js');

module.exports = {
	findVotesBallotIds: function(deputyId) {
		return Vote.find()
		.where({ deputyId: deputyId })
		.then(function(votes) {
			return Promise.map(votes, function(vote) {
				return vote.ballotId;
			})
		})
	},

	findVotesOrderedByDeputy: function() {
		return Vote.find()
		.sort('deputyId ASC');
	},

	findVoteForDeputyAndBallot: function(deputyId, ballotId) {
		return Vote.findOne()
		.where({ ballotId: ballotId, deputyId: deputyId });
	},

	findLastVotesByDeputy: function(afterDate, currentDeputies) {
		return BallotService.findBallotsWithLawCreatedFromDate(afterDate)
		.then(lastBallotsWithLaw => {
			if (lastBallotsWithLaw.length > 0) {
				return Promise.filter(lastBallotsWithLaw, function(ballotWithLaw) {
					return DateHelper.isLaterOrSame(ballotWithLaw.date, afterDate);
				})
				.map(ballotWithLaw => {
					return findVotesForBallot(ballotWithLaw, currentDeputies)
				})
				.reduce((prev, cur) => {
					return prev.concat(cur);
				})
				.then(allVotes => {
					return mapVotesByDeputy(allVotes);
				});
			}
		});
	},

	findVotes: function(ballotId) {
		return Vote.find()
		.where({ ballotId: ballotId })
	}
};

let findVotesForBallot = function(ballot, currentDeputies) {
	return Vote.find()
	.where({ ballotId: ballot.officialId })
	.populate('deputyId')
	.then(votes => {
		let votesIncludingMissing = [];
		let formattedVote;
		for (let i in currentDeputies) {
			let currentDeputy = currentDeputies[i];
			let vote = getVoteForDeputy(currentDeputy.officialId, votes)
			if (vote) {
				formattedVote = ResponseHelper.createVoteForPush(ballot, vote)
			} else {
				formattedVote = ResponseHelper.createMissingVoteForPush(ballot, currentDeputy)
			}
			votesIncludingMissing.push(formattedVote);
		}
		return votesIncludingMissing;
	})
}

let getVoteForDeputy = function(deputyId, votes) {
	let vote;
	for (let i in votes) {
		if (votes[i].deputyId.officialId === deputyId) {
			vote = votes[i];
			break;
		}
	}
	return vote;
}

let mapVotesByDeputy = function(allVotes) {
	let votesByDeputy = [];
	if (allVotes) {
		allVotes.sort(function(a, b) {
			return a.deputyId - b.deputyId;
		});

		for (let i in allVotes) {
			let vote = allVotes[i];
			let picked = votesByDeputy.find(o => o.deputyId === vote.deputyId);
			if (!picked) {
				picked = { 'deputyId': vote.deputyId, 'activities': [] };
				votesByDeputy.push(picked);
			}
			delete vote.deputyId;
			picked['activities'].push(vote);
		}
	}
	return votesByDeputy;
}
