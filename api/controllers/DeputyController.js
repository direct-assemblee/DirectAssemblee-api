let DateHelper = require('../services/helpers/DateHelper.js');

module.exports = {
	getDeputies: function(req, res) {
		if (req.param('latitude') || req.param('longitude')) {
			return getDeputiesWithCoordinates(req, res);
		} else {
			return res.json(400, 'Must provide latitude and longitude arguments')
		}
	},

	getDeputy: function(req, res) {
		let departmentId = req.param('departmentId');
		let district = req.param('district');
		if (departmentId && district) {
			let fomattedNow = DateHelper.getFormattedNow();
			return DeputyService.returnMostRecentDeputyAtDate(departmentId, district, fomattedNow)
			.then(function(deputy) {
				if (deputy) {
					if (deputy.mandateEndDate) {
						return res.json(404, 'Found deputy, but mandate has ended.');
					} else {
						return res.json(deputy);
					}
				} else {
					return res.json(404, 'Could not find deputy, sorry.');
				}
			})
		} else {
			return res.json(400, 'Must provide departmentId and district arguments');
		}
	}
}

let getDeputiesWithCoordinates = function(req, res) {
	return GeolocService.getAddress(req.param('latitude'), req.param('longitude'))
	.then(function(districts) {
		if (districts && districts.length > 0) {
			let deputies = []
			for (let i in districts) {
				deputies.push(DeputyService.getDeputyForGeoDistrict(districts[i]));
			}
			return Promise.all(deputies)
			.then(function(deputies) {
				let deputiesArray = [];
				for (let i in deputies) {
					for (let j in deputies[i]) {
						deputiesArray.push(deputies[i][j]);
					}
				}
				return res.json(deputiesArray);
			})
		} else {
			return res.json(404, 'Sorry, no district found');
		}
	})
}
