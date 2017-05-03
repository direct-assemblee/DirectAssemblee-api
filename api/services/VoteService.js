var Promise = require("bluebird");
var DateHelper = require('./helpers/DateHelper.js');

var self = module.exports = {
	findAllVotes: function(deputyId) {
		return Vote.find()
		.where({ deputyId: deputyId })
		.populate('ballotId');
	},

	findVotes: function(deputyId, solemnOnly) {
		return self.findAllVotes(deputyId)
		.then(function (votesForDepute) {
			if (solemnOnly) {
				var votesArray = [];
				var vote;
				for (i in votesForDepute) {
					vote = votesForDepute[i];
					if (vote.ballotId.type === 'SSO') {
						votesArray.push(vote);
					}
				}
				return votesArray;
			} else {
				return votesForDepute;
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
			if (ballotType === "motion_of_censure") {
				return vote && vote.value === "for" ? "signed" : "not_signed" 
			} else {
				return vote ? vote.value : 'missing';
			}
		})
	},

	getVotesForDeputeId: function(deputeId, limit, skip) {
		return Vote.find()
		.where({ deputeId: deputeId })
		.limit(limit)
		.skip(skip)
		.populate('lawId')
		.then(function (votesForDepute) {
			votesForDepute.sort(function(a, b) {
  			return new Date(a.lawId.date).getTime() - new Date(b.lawId.date).getTime()
			});

			var votesArray = [];
			for (i in votesForDepute) {
				var voteIter = votesForDepute[i];
				var vote = {
					'lawTitle': voteIter['lawId'].title,
					'lawId': voteIter['lawId'].id,
					'date': voteIter['lawId'].date,
					'value': voteIter['value']
				}
				votesArray.push(vote)
			}
			return Promise.resolve(votesArray);
		})
	},

	findLastVotesByDepute: function(lastScanTime) {
		return Law.find()
		.where({ date: { '>': lastScanTime } })
		.then(function(lastLaws) {
			var promises = [];
			for (i in lastLaws) {
				promises.push(self.findVotesForLaw(lastLaws[i]));
			}
			return Promise.all(promises)
			.then(function(votes) {
				var allVotes = [];
				for (i in votes) {
					allVotes = allVotes.concat(votes[i]);
				}
				return self.mapVotesByDepute(allVotes);
			});
		});
	},

	findVotesForLaw: function(law) {
		return Vote.find()
		.where({ lawId: law.id })
		.populate('deputeId')
		.then(function(votes) {
			var extendedVotes = [];
			for (i in votes) {
				var vote = votes[i];
				extendedVotes.push({
					'lawId' : law.id,
					'lawTitle' : law.title,
					'deputeId' : vote.deputeId.id,
					'deputeName' : vote.deputeId.firstname + " " + vote.deputeId.lastname,
					'value' : vote.value
				});
			}
			return Promise.resolve(extendedVotes);
		})
	},

	mapVotesByDepute: function(allVotes) {
		allVotes.sort(function(a, b) {
			return a.deputeId - b.deputeId;
		});

		var votesByDepute = [];
		for (i in allVotes) {
			var vote = allVotes[i];
			var picked = votesByDepute.find(o => o.depute.id === vote.deputeId);
			if (!picked) {
				picked = { 'depute': { 'id': vote.deputeId, 'name': vote.deputeName }, 'votes': [] };
				votesByDepute.push(picked);
			}
			// delete vote.deputeId;
			picked['votes'].push({
				'lawId' : vote.lawId,
				'lawTitle' : vote.lawTitle,
				'value' : vote.value
			});
		}
		console.log(votesByDepute)
		return votesByDepute;
	}
};
