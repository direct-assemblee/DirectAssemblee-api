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

	findVotesWithValueForBallot: function(ballotId, value) {
		return Vote.find()
		.where({ ballotId: ballotId , value: value })
	},

	findVoteForDeputyAndBallot: function(deputyId, ballotId) {
		return Vote.findOne()
		.where({ ballotId: ballotId, deputyId: deputyId });
	},

	findLastVotesByDeputy: function(afterDate, currentDeputies) {
		return Ballot.find()
		.where({ date: { '>=': afterDate }})
		.populate('themeId')
		.then(function(lastBallots) {
			if (lastBallots.length > 0) {
				return Promise.filter(lastBallots, function(ballot) {
					return DateHelper.isLaterOrSame(ballot.createdAt, ballot.date);
				})
				.map(function(ballot) {
					return findVotesForBallot(ballot, currentDeputies)
				})
				.reduce(function(prev, cur) {
					return prev.concat(cur);
				})
				.then(function(allVotes) {
					return mapVotesByDeputy(allVotes);
				});
			}
		});
	}
};

let findVotesForBallot = function(ballot, currentDeputies) {
	return Vote.find()
	.where({ ballotId: ballot.id })
	.populate('deputyId')
	.then(function(votes) {
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
	allVotes.sort(function(a, b) {
		return a.deputyId - b.deputyId;
	});

	let votesByDeputy = [];
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
	return votesByDeputy;
}
