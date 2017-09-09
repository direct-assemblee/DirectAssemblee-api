const actionUtil = require('../../node_modules/sails/lib/hooks/blueprints/actionUtil')

module.exports = {
	getVotes: function(req, res) {
		Vote.find()
		.limit(actionUtil.parseLimit(req))
		.skip(actionUtil.parseSkip(req))
		.exec(function(err, votes) {
			if (err) {
				return res.json(err);
			}
			return res.json(votes)
		})
	},

	getVotesForDeputeId: function(req, res) {
		VoteService.getVotesForDeputeId(req.param('deputeId'), actionUtil.parseLimit(req), actionUtil.parseSkip(req))
		.then(function(deputeWithVotes) {
			return res.json(deputeWithVotes);
		}).catch(function(err) {
			sails.log.error(err);
			return res.negotiate(err);
		});
	}
};
