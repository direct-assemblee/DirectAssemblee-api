let ResponseHelper = require('../services/helpers/ResponseHelper.js');
let DeputyService = require('../services/DeputyService.js');
let TimelineService = require('../services/TimelineService.js');

let self = module.exports = {
	getTimeline: function(req, res) {
		let deputyId = req.param('deputyId');
		if (!deputyId) {
			return res.json(400, 'Must provide deputyId as a parameter.');
		} else {
			let page = req.param('page') ? req.param('page') : 0;
			return self.getTimelineForDeputy(deputyId, parseInt(page))
			.then(function(result) {
				if (result.code === 200) {
					return res.json(result.response);
				} else {
					return res.json(result.code, result.message);
				}
			})
		}
	},

	getTimelineForDeputy: function(deputyId, page) {
		return DeputyService.findDeputyWithId(deputyId)
		.then(function(deputy) {
			if (!deputy) {
				return { code: 404, message: 'No deputy found with id : ' + deputyId };
			} else if (!deputy.currentMandateStartDate) {
				return { code: 404, message: 'Mandate has ended for deputy with id : ' + deputyId };
			} else {
				return TimelineService.getTimeline(deputy, page)
				.then(function(timelineItems) {
					let formattedItems = formatTimelineResponse(timelineItems, deputy);
					return { code: 200, response: formattedItems }
				})
			}
		})
	}
};

let formatTimelineResponse = function(items, deputy) {
	let results = [];
	for (let i in items) {
		let item = items[i];
		if (item.totalVotes > 0) {
			let voteValue = ResponseHelper.createVoteValueForWS(item.type, item.deputyVote);
			item = ResponseHelper.createBallotDetailsResponse(item, deputy, voteValue);
		}
		results.push(item);
	}
	return results;
}
