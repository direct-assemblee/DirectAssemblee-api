module.exports = {
	getTimeline: function(req, res) {
		let deputyId = req.param('deputyId');
		if (!deputyId) {
			return res.json(400, 'Must provide deputyId as a parameter.');
		} else {
			let offset = req.param('page') ? req.param('page') : 0;
			return DeputyService.findDeputyWithId(deputyId)
			.then(function(deputy) {
				if (!deputy) {
					return res.json(404, 'No deputy found with id : ' + deputyId);
				} else if (!deputy.currentMandateStartDate) {
					return res.json(404, 'Mandate has ended for deputy with id : ' + deputyId);
				} else {
					return TimelineService.getTimeline(deputy, parseInt(offset))
					.then(function(timelineItems) {
						return res.json(timelineItems);
					})
				}
			})
		}
	}
};
