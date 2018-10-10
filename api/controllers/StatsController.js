let ResponseBuilder = require('./helpers/ResponseBuilder.js');
let ActivityRateService = require('../services/ActivityRateService.js');
let ParliamentGroupService = require('../services/ParliamentGroupService.js');
let DeputyResponseHelper = require('./helpers/DeputyResponseHelper.js');

const PARAM_GROUP_ID = 'groupId'

module.exports = {
	getActivityRates: function(req, res) {
		return getRates(req.param(PARAM_GROUP_ID))
		.then(result => {
			return ResponseBuilder.build(res, 200, result)
		})
	}
};

let getRates = function(groupId) {
	if (groupId) {
		return getActivityRatesForGroup(groupId)
	} else {
		return ActivityRateService.getSortedActivityRatesByParliamentGroup()
	}
}

let getActivityRatesForGroup = function(groupId) {
	return ActivityRateService.getSortedActivityRatesForParliamentGroup(groupId)
	.then(deputies => {
		return DepartmentService.findDepartements()
		.then(departments => {
			return DeputyResponseHelper.prepareSimpleDeputiesResponse(deputies, departments)
		})
	})
	.then(deputies => {
		return ParliamentGroupService.findGroupWithId(groupId)
		.then(group => {
			return {
				group: group,
				deputies: deputies
			}
		})
	})
}
