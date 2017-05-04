const actionUtil = require('../../node_modules/sails/lib/hooks/blueprints/actionUtil')

var self = module.exports = {
	getDeputies: function(req, res) {
		if (req.param('latitude') || req.param('longitude')) {
		 	return getDeputiesWithCoordinates(req, res);
		} else {
			return res.badRequest('Must provide latitude and longitude arguments')
		}
	},

	getDeputy: function(req, res) {
		if (req.param('id')) {
			return getDeputyWithId(req.param('id'), res);
		} else {
			var departmentId = req.param('departmentId');
			var circonscription = req.param('circonscription');
			if (departmentId && circonscription) {
				return DeputyService.findDeputiesForCirconscription(departmentId, circonscription, true)
				.then(function(deputies) {
					if (deputies && deputies.length > 0) {
						deputies.sort(function(a, b) {
							return new Date(b.currentMandateStartDate).getTime() - new Date(a.currentMandateStartDate).getTime()
						});
						return getDeputyWithId(deputies[0].id, res);
					} else {
						return res.notFound('Could not find deputy, sorry.');
					}
				})
			} else {
				return res.badRequest('Must provide id or departmentId and circonscription arguments')
			}
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
			return res.notFound("Sorry, no circonscription found")
		}
	})
}

var getDeputyWithId = function(id, res) {
	return DeputyService.findDeputyWithId(id)
	.then(function(deputy) {
		if (!deputy) {
			return res.notFound('Could not find deputy, sorry.');
		}
		return res.json(deputy);
	})
}
