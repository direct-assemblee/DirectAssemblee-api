let Promise = require('bluebird');

const PARAM_DEPUTY_ID = 'deputyId'
const PARAM_TYPE = 'type'
const PARAM_WORK_ID = 'workId'

module.exports = {
	deputiesUpdated: function(req, res) {
		let deputiesIds = req.param('deputiesIds');
		if (deputiesIds) {
			Promise.each(deputiesIds, function(deputyId) {
				findWorksForUpdatedDeputy(deputyId);
			})
			return res.status(200).json('OK');
		} else {
			return res.status(400).json('Must provide deputyId argument');
		}
	},

	ballotsUpdated: function(req, res) {
		LastWorksService.updateLastScanTime()
		return res.status(200).json('OK');
	},

	sendTestPushNotif: function(req, res) {
		let deputyId = req.param(PARAM_DEPUTY_ID);
		let type = req.param(PARAM_TYPE);
		let workId = req.param(PARAM_WORK_ID);
		if (deputyId && workId && Constants.WORK_TYPES.includes(type)) {
			TestService.sendPush(deputyId, type, workId);
			return res.status(200).json('OK');
		} else {
			return res.status(400).json('Must provide deputyId and valid type arguments');
		}
	}
};

let findWorksForUpdatedDeputy = function(deputyId) {
	return LastWorksService.findNewWorks(deputyId)
	.then(function(newWorks) {
		if (newWorks && newWorks.length > 0) {
			console.log('- deputy ' + deputyId + ' has ' + newWorks.length + ' new works to be pushed')
			return CacheService.resetTimeline(deputyId)
			.then(function() {
				return PushNotifService.pushDeputyActivities(deputyId, newWorks);
			})
		} else {
			// console.log('- deputy ' + deputyId + ' has no new works to be pushed')
			return;
		}
	})
}
