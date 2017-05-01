const actionUtil = require('../../node_modules/sails/lib/hooks/blueprints/actionUtil')

var self = module.exports = {
	getBallots: function(req, res) {

	},

	getBallotWithId: function(req, res) {
		BallotService.getBallotWithId(req.param('id'), req.param('departmentId'), req.param('circonscription'))
		.then(function(ballot) {
			if (!ballot) {
				return res.notFound('Could not find ballot, sorry.');
			}
			return res.json(ballot);
		}).catch(function(err) {
      sails.log.error(err);
			return res.negotiate(err);
    });
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
