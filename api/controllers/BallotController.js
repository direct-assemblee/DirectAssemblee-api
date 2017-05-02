const actionUtil = require('../../node_modules/sails/lib/hooks/blueprints/actionUtil')

var self = module.exports = {
	getBallots: function(req, res) {
		var offset = req.param('offset');
		if (!offset) {
			offset = 0;
		}

	},

	getBallotDetails: function(req, res) {
		var id = req.param('id');
		var departmentId = req.param('departmentId');
		var circonscription = req.param('circonscription');
		if (id && departmentId && circonscription) {
			BallotService.getBallotWithId(id, departmentId, circonscription)
			.then(function(ballot) {
				if (!ballot) {
					return res.notFound('Could not find ballot, sorry.');
				} else {
		      DeputyService.findDeputyForCirconscriptionAndDate(departmentId, circonscription, ballot.date)
		      .then(function(deputy) {
		        return VoteService.findVoteForDeputyAndBallot(deputy.id, ballot.id)
		        .then(function(vote) {
		          ballot.userDeputyVote = {
		            'voteValue': vote.value ? vote.value : 'missing',
		            'deputy': {
		              'firstname': deputy.firstname,
		              'lastname': deputy.lastname
		            }
		          }
	          	return res.json(ballot);
						})
			    })
				}
			}).catch(function(err) {
	      sails.log.error(err);
				return res.negotiate(err);
	    });
		} else {
			return res.badRequest('Must provide id, departmentId and circonscription as parameters.');
		}
	},

	create: function(req, res) {
		return res.json(404, "not found")
	},

	update: function(req, res) {
		return res.json(404, "not found")
	},

	destroy: function(req, res) {
		return res.json(404, "not found")
	},

	populate: function(req, res) {
		return res.json(404, "not found")
	},

	add: function(req, res) {
		return res.json(404, "not found")
	},

	remove: function(req, res) {
		return res.json(404, "not found")
	}
};
