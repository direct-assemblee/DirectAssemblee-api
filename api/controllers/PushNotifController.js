let Promise = require('bluebird');

module.exports = {
	deputiesUpdated: function(req, res) {
		let deputiesIds = req.param('deputiesIds');
		if (deputiesIds) {
			Promise.each(deputiesIds, function(deputyId) {
				findWorksForUpdatedDeputy(deputyId);
			})
			return res.json(200);
		} else {
			return res.json(400, 'Must provide deputyId argument')
		}
	},

	ballotsUpdated: function(req, res) {
		return res.json(200);
	},

	sendTestPushNotif: function(req, res) {
		let deputyId = req.param('deputyId');
		let type = req.param('type');
		let workId = req.param('workId');
		if (deputyId && workId && Constants.WORK_TYPES.includes(type)) {
			TestService.sendPush(deputyId, type, workId);
			return res.json(200);
		} else {
			return res.json(400, 'Must provide deputyId and valid type arguments')
		}
	}
};

let findWorksForUpdatedDeputy = function(deputyId) {
	return LastWorksService.findNewWorks(deputyId)
	.then(function(newWorks) {
		if (newWorks && newWorks.length > 0) {
			console.log('- deputy ' + deputyId + ' has ' + newWorks.length + ' new works to be pushed')
			return PushNotifService.pushDeputyActivities(deputyId, newWorks);
		} else {
			// console.log('- deputy ' + deputyId + ' has no new works to be pushed')
			return;
		}
	})
}
