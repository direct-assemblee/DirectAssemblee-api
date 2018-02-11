let ResponseHelper = require('../services/helpers/ResponseHelper.js');
let DeputyService = require('../services/DeputyService.js');
let TimelineService = require('../services/TimelineService.js');
let CacheService = require('../services/CacheService.js');

module.exports = {
	getTimeline: function(req, res) {
		let deputyId = req.param('deputyId');
		if (!deputyId) {
			return res.status(400).json('Must provide deputyId as a parameter.');
		} else {
			let page = req.param('page') ? req.param('page') : 0;
			let key = 'timeline_' + deputyId + '_' + page;
			return CacheService.get(key)
			.then(function(cached) {
				if (!cached) {
					return getTimelineForDeputy(deputyId, parseInt(page))
					.then(function(result) {
						CacheService.set(key, result);
						return res.status(result.code).json(result.content);
					})
				} else {
					return res.status(cached.code).json(cached.content);
				}
			})
		}
	}
};

let getTimelineForDeputy = function(deputyId, page) {
	return DeputyService.findDeputyWithId(deputyId)
	.then(function(deputy) {
		if (!deputy) {
			return { code: 404, content: 'No deputy found with id : ' + deputyId };
		} else if (!deputy.currentMandateStartDate) {
			return { code: 404, content: 'Mandate has ended for deputy with id : ' + deputyId };
		} else {
			return TimelineService.getTimeline(deputy, page)
			.then(function(timelineItems) {
				let formattedItems = formatTimelineResponse(timelineItems, deputy);
				return { code: 200, content: formattedItems }
			})
		}
	})
}

let formatTimelineResponse = function(items, deputy) {
	let results = [];
	for (let i in items) {
		let item = items[i];
		if (item.totalVotes > 0) {
			let voteValue = ResponseHelper.createVoteValueForWS(item.type, item.deputyVote);
			item = ResponseHelper.createBallotDetailsResponse(item, deputy, voteValue);
		} else {
			item = ResponseHelper.createWorkForTimeline(item, item.extraInfos);
		}
		results.push(item);
	}
	return results;
}
