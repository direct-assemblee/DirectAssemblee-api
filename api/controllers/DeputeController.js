/**
 * DeputesController
 *
 * @description :: Server-side logic for managing deputes
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

const actionUtil = require('../../node_modules/sails/lib/hooks/blueprints/actionUtil')

var self = module.exports = {
	getDeputes: function(req, res) {
		Depute.find().sort('lastname ASC')
		.limit(actionUtil.parseLimit(req))
		.skip(actionUtil.parseSkip(req))
		.then(function(err, deputes) {
			if (err) {
				return res.json(err);
			}
			return res.json(deputes)
		});
	},

	getDeputeWithId: function(req, res) {
		DeputeService.getDeputeInfosWithId(req.param('id'))
		.then(function(depute) {
			if (!depute) {
				return res.notFound('Could not find depute, sorry.');
			}
			return res.json(depute);
		}).catch(function(err) {
      sails.log.error(err);
			return res.negotiate(err);
    });
	},

	getDeputesFromDepartmentCode: function(req, res) {
		var subDep = req.param('subDepartment');
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

	getDeputesFromDepartmentId: function(departmentId, subDepartment, res) {
		var criteria = {};
		criteria.departmentId = departmentId;
		if (subDepartment > 0) {
			criteria.subDepartment = subDepartment;
		}

		Depute.find().sort('lastname ASC')
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
