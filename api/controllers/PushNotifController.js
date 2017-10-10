module.exports = {
	deputyUpdated: function(req, res) {
		let deputyId = req.param('deputyId');
		if (deputyId) {
			return LastWorksService.findNewWorks(deputyId)
			.then(function(newWorks) {
				if (newWorks && newWorks.length > 0) {
                    console.log('- deputy ' + deputyId + ' has ' + newWorks.length + ' new works to be pushed')
                    return PushNotifService.pushDeputyActivities(deputyId, newWorks);
                } else {
					// console.log('- deputy ' + deputyId + ' has no new works to be pushed')
				}
				return res.json(200);
			})
		} else {
			return res.json(400, 'Must provide deputyId argument')
		}
	},

	ballotsUpdated: function(req, res) {
		return LastWorksService.findNewVotes()
		.then(function(newVotesByDeputy) {
			LastWorksService.updateLastScanTime();
			if (newVotesByDeputy) {
				if (newVotesByDeputy) {
					return Promise.map(newVotesByDeputy, function(deputyVotes) {
						console.log('- deputy ' + deputyVotes.deputyId + ' voted for ' + deputyVotes.activities.length + ' ballots to be pushed')
						return PushNotifService.pushDeputyActivities(deputyVotes);
					}, {concurrency: 10})
				}
			} else {
				console.log('- no new votes to be pushed')
			}
			return res.json(200);
		})
	},

	sendTestPushNotif: function(req, res) {
		let deputyId = req.param('deputyId');
		let type = req.param('type');
		if (deputyId && Constants.WORK_TYPES.includes(type)) {
			TestService.sendPush(deputyId, type);
			return res.json(200);
		} else {
			return res.json(400, 'Must provide deputyId and valid type arguments')
		}
	}
};
