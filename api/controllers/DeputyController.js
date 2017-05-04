const actionUtil = require('../../node_modules/sails/lib/hooks/blueprints/actionUtil')

var self = module.exports = {
	getDeputies: function(req, res) {
		if (req.param('latitude') || req.param('longitude')) {
		 	self.getDeputiesWithCoordinates(req, res);
		} else {
			self.getAllDeputies(req, res);
		}
	},

	getDeputy: function(req, res) {
		if (req.param('id')) {
			self.getDeputyWithId(req, res);
		} else {
			var departmentId = req.param('departmentId');
			var circonscription = req.param('circonscription');
			DeputyService.findDeputiesForCirconscription(departmentId, circonscription, true)
			.then(function(deputies) {
				if (deputies && deputies.length > 0) {
						deputies.sort(function(a, b) {
						return new Date(b.currentMandateStartDate).getTime() - new Date(a.currentMandateStartDate).getTime()
					});
					self.getDeputyWithId(deputies[0].id, res);
				} else {
					return res.notFound('Could not find deputy, sorry.');
				}
			})
		}
	},

	getDeputyWithId: function(req, res) {
		self.getDeputyWithId(req.param('id'), res);
	},

	getDeputyWithId: function(id, res) {
		DeputyService.getDeputyWithId(id)
		.then(function(deputy) {
			if (!deputy) {
				return res.notFound('Could not find deputy, sorry.');
			}
			return res.json(deputy);
		}).catch(function(err) {
      sails.log.error(err);
			return res.negotiate(err);
    });
	},

	getDeputiesWithCoordinates: function(req, res) {
		DeputyService.getDeputiesWithCoordinates(req.param('latitude'), req.param('longitude'))
		.then(function(deputies) {
			if (!deputies) {
				return res.notFound('Could not find deputy, sorry.');
			}
			return res.json({ "deputies" : deputies });
		}).catch(function(err) {
      sails.log.error(err);
			return res.negotiate(err);
    });
	},

	getAllDeputies: function(req, res) {
		Deputy.find().sort('lastname ASC')
		.limit(actionUtil.parseLimit(req))
		.skip(actionUtil.parseSkip(req))
		.then(function(err, deputies) {
			if (err) {
				return res.json(err);
			}
			return res.json(deputies)
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
