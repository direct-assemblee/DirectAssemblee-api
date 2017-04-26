const actionUtil = require('../../node_modules/sails/lib/hooks/blueprints/actionUtil')

var self = module.exports = {
	getDeputies: function(req, res) {
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

	getDeputyWithId: function(req, res) {
		DeputyService.getDeputyWithId(req.param('id'))
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

	getDeputyTimeline: function(req, res) {
		var offset = req.param('offset');
		if (!offset) {
			offset = 0;
		}
		DeputyService.getDeputyTimelineForPage(req.param('id'), parseInt(offset))
		.then(function(timelineItems) {
			if (!timelineItems) {
				return res.notFound('Could not find timeline items, sorry.');
			}
			return res.json(timelineItems);
		}).catch(function(err) {
      sails.log.error(err);
			return res.negotiate(err);
    });
	},

	getDeputesFromDepartmentCode: function(req, res) {
		var subDep = req.param('circonscription');
		Department.findOne({
			code: req.param('departmentCode')
		}).then(function(department) {
			if (!department) {
				return res.notFound('Could not find department, sorry.');
			} else {
				return self.getDeputesFromDepartmentId(department.id, subDep, res);
			}
		});
	},

	getDeputesFromDepartmentId: function(departmentId, circonscription, res) {
		var criteria = {};
		criteria.departmentId = departmentId;
		if (circonscription > 0) {
			criteria.circonscription = circonscription;
		}

		Deputy.find().sort('lastname ASC')
		.limit(actionUtil.parseLimit(req))
		.skip(actionUtil.parseSkip(req))
		.where(criteria)
		.then(function(err, deputes) {
			if (err) {
				return res.json(err);
			}
			return res.json(deputes);
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
