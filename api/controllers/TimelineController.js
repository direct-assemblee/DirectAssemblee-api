let ResponseHelper = require('../services/helpers/ResponseHelper.js');
let DeputyService = require('../services/DeputyService.js');
let TimelineService = require('../services/TimelineService.js');
let CacheService = require('../services/CacheService.js');
let ResponseBuilder = require('./ResponseBuilder.js');

let self = module.exports = {
	getTimeline: function(req, res) {
		let deputyId = req.param('deputyId');
		if (!deputyId) {
			return ResponseBuilder.build(res, 400, 'Must provide deputyId as a parameter.')
		} else {
			let page = req.param('page') ? req.param('page') : 0;
			return CacheService.getTimeline(deputyId, page)
			.then(function(cached) {
				if (!cached) {
					return self.getTimelineForDeputy(deputyId, parseInt(page))
					.then(function(result) {
						CacheService.setTimeline(deputyId, page, result);
						return ResponseBuilder.build(res, result.code, result.content);
					})
				} else {
					return ResponseBuilder.build(res, cached.code, cached.content);
				}
			})
		}
	},

	getTimelineForDeputy: function(deputyId, page) {
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
};

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
