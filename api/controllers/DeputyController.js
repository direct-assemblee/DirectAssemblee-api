const actionUtil = require('../../node_modules/sails/lib/hooks/blueprints/actionUtil')
var DateHelper = require('../services/helpers/DateHelper.js');

var self = module.exports = {
	getDeputies: function(req, res) {
		if (req.param('latitude') || req.param('longitude')) {
		 	return getDeputiesWithCoordinates(req, res);
		} else {
			return res.json(400, 'Must provide latitude and longitude arguments')
		}
	},

	getDeputy: function(req, res) {
		var departmentId = req.param('departmentId');
		var circonscription = req.param('circonscription');
		if (departmentId && circonscription) {
			return DeputyService.findDeputiesForCirconscription(departmentId, circonscription, false)
			.then(function(deputies) {
				if (deputies && deputies.length > 0) {
					deputies.sort(function(a, b) {
						var diff = DateHelper.getDiff(b.currentMandateStartDate, a.currentMandateStartDate);
						return diff < 0 ? -1 : 1;
					});
					var mostRecentDeputy = deputies[0];
					if (mostRecentDeputy.currentMandateStartDate) {
						return getDeputyWithId(deputies[0].id, res);
					} else {
						return res.json(404, 'Found deputy, but mandate has ended.');
					}
				} else {
					return res.json(404, 'Could not find deputy, sorry.');
				}
			})
		} else {
			return res.json(400, 'Must provide departmentId and circonscription arguments')
		}
	}
}

var getDeputiesWithCoordinates = function(req, res) {
	return GeolocService.getAddress(req.param('latitude'), req.param('longitude'))
	.then(function(circonscriptions) {
		if (circonscriptions && circonscriptions.length > 0) {
			var deputies = []
			for (i in circonscriptions) {
				deputies.push(DeputyService.getDeputyForGeoCirconscription(circonscriptions[i]));
			}
			return Promise.all(deputies)
			.then(function(deputies) {
				var deputiesArray = [];
				for (i in deputies) {
					for (j in deputies[i]) {
						deputiesArray.push(deputies[i][j]);
					}
				}
				return res.json({ "deputies" : deputiesArray });
			})
		} else {
			return res.json(404, "Sorry, no circonscription found")
		}
	})
}

var getDeputyWithId = function(id, res) {
	return DeputyService.findDeputyWithId(id)
	.then(function(deputy) {
		if (!deputy) {
			return res.json(404, 'Could not find deputy, sorry.');
		}
		return res.json(deputy);
	})
}
