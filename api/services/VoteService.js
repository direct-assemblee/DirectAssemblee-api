var Promise = require("bluebird");
var ResponseHelper = require('./helpers/ResponseHelper.js');

var self = module.exports = {
	findAllVotes: function(deputyId) {
		return Vote.find()
		.where({ deputyId: deputyId })
		.populate('ballotId');
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

	findVotesForBallot: function(ballotId, value) {
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

	findLastVotesByDeputy: function(lastScanTime) {
		return Ballot.find()
		.where({ date: { '<': lastScanTime } })
		.then(function(lastBallots) {
			return Promise.map(lastBallots, function(ballot) {
		    return self.findVotesForBallot(ballot)
			})
			.reduce(function(prev, cur) {
 				return prev.concat(cur);
			})
			.then(function(allVotes) {
				return mapVotesByDeputy(allVotes);
			});
		});
	},

	findVotesForBallot: function(ballot) {
		return Vote.find()
		.where({ ballotId: ballot.id })
		.populate('deputyId')
		.then(function(votes) {
			return Promise.map(votes, function(vote) {
		    return ResponseHelper.createVoteForPush(ballot, vote);
			})
		})
	}
};

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
