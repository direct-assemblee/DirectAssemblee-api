const actionUtil = require('../../node_modules/sails/lib/hooks/blueprints/actionUtil')

var self = module.exports = {
	getBallots: function(req, res) {
		var offset = req.param('page') ? parseInt(req.param('page')) : 0;
		return BallotService.findBallots(offset)
		.then(function(ballots) {
			return res.json(ballots)
		})
	},

	getBallotDetails: function(req, res) {
		var id = req.param('id');
		var departmentId = req.param('departmentId');
		var circonscription = req.param('circonscription');
		if (id && departmentId && circonscription) {
			return BallotService.getBallotWithId(id)
			.then(function(ballot) {
				if (ballot) {
					return getBallotWithDeputyVote(ballot, departmentId, circonscription)
					.then(function(ballotResponse) {
						res.json(ballotResponse);
					})
				} else {
					return res.json(404, 'Could not find ballot with id ' + id);
				}
			})
		} else {
			return res.json(400, 'Must provide id, departmentId and circonscription as parameters.');
		}
	}
};

var getBallotWithDeputyVote = function(ballot, departmentId, circonscription) {
	return DeputyService.findDeputyAtDateForCirconscription(departmentId, circonscription, ballot.date)
	.then(function(deputy) {
		if (deputy) {
			return VoteService.findVoteValueForDeputyAndBallot(deputy.id, ballot.id, ballot.type)
			.then(function(voteValue) {
				ballot.userDeputyVote = {
					'voteValue': voteValue,
					'deputy': {
						'firstname': deputy.firstname,
						'lastname': deputy.lastname
					}
				}
				return ballot;
			})
		} else {
			return ballot;
		}
	})
}
