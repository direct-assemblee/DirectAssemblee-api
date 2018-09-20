let ResponseBuilder = require('./helpers/ResponseBuilder.js');
let ActivityRateService = require('../services/ActivityRateService.js');

module.exports = {
	getActivityRatesByGroup: function(req, res) {
		return ActivityRateService.getSortedActivityRatesByParliamentGroup()
		.then(groupedRates => {
			return ResponseBuilder.build(res, 200, { activityRatesByGroup: groupedRates })
		})
	}
};
