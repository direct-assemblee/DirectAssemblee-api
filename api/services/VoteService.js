var Promise = require("bluebird");
var ResponseHelper = require('./helpers/ResponseHelper.js');
var DateHelper = require('./helpers/DateHelper.js');
var moment = require('moment');

var self = module.exports = {
	findAllVotes: function(deputyId) {
		return Vote.find()
		.where({ deputyId: deputyId })
		.populate('ballotId');
	},

	findVotesBallotIds: function(deputyId) {
		return Vote.find()
		.where({ deputyId: deputyId })
		.then(function(votes) {
			return Promise.map(votes, function(vote) {
				return vote.ballotId;
			})
		})
	},

	findVotesDates: function(deputyId, solemnOnly) {
		return self.findVotes(deputyId, solemnOnly)
		.map(function(vote) {
			return DateHelper.formatSimpleDate(vote.ballotId.date);
		})
	},

	findVotes: function(deputyId, solemnOnly) {
		return self.findAllVotes(deputyId)
		.then(function (votesForDeputy) {
			if (solemnOnly) {
				var votesArray = [];
				var vote;
				for (i in votesForDeputy) {
					vote = votesForDeputy[i];
					if (vote.ballotId.type === 'SSO') {
						votesArray.push(vote);
					}
				}
				return votesArray;
			} else {
				return votesForDeputy;
			}
		})
	},

	findVotesWithValueForBallot: function(ballotId, value) {
		return Vote.find()
		.where({ ballotId: ballotId , value: value })
	},

	findVoteValueForDeputyAndBallot: function(deputyId, ballotId, ballotType) {
		return Vote.findOne()
		.where({ ballotId: ballotId, deputyId: deputyId })
		.then(function(vote) {
			return ResponseHelper.createVoteValueForWS(ballotType, vote)
		})
	},

	findLastVotesByDeputy: function(afterDate, currentDeputies) {
		return Ballot.find()
		.where({ date: { '>=': afterDate }})
		.then(function(lastBallots) {
			if (lastBallots.length > 0) {
				return Promise.filter(lastBallots, function(ballot) {
					return DateHelper.isLater(ballot.createdAt, ballot.date);
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

var findVotesForBallot = function(ballot, currentDeputies) {
	return Vote.find()
	.where({ ballotId: ballot.id })
	.populate('deputyId')
	.then(function(votes) {
		var votesIncludingMissing = [];
		var formattedVote;
		var currentDeputyId;
		for (i in currentDeputies) {
			currentDeputy = currentDeputies[i];
			var vote = getVoteForDeputy(currentDeputy.id, votes)
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

var getVoteForDeputy = function(deputyId, votes) {
	var vote;
	for (i in votes) {
		if (votes[i].deputyId.id === deputyId) {
			vote = votes[i];
			break;
		}
	}
	return vote;
}

var mapVotesByDeputy = function(allVotes) {
	allVotes.sort(function(a, b) {
		return a.deputyId - b.deputyId;
	});

	var votesByDeputy = [];
	for (i in allVotes) {
		var vote = allVotes[i];
		var picked = votesByDeputy.find(o => o.deputyId === vote.deputyId);
		if (!picked) {
			picked = { 'deputyId': vote.deputyId, 'activities': [] };
			votesByDeputy.push(picked);
		}
		delete vote.deputyId;
		picked['activities'].push(vote);
	}
	return votesByDeputy;
}
