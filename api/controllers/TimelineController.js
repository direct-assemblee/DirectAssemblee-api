let TimelineResponseHelper = require('./helpers/TimelineResponseHelper.js');
let DeputyService = require('../services/DeputyService.js');
let TimelineService = require('../services/TimelineService.js');
let CacheService = require('../services/CacheService.js');
let ResponseBuilder = require('./helpers/ResponseBuilder.js');

const PARAM_DEPUTY_ID = 'deputyId'
const PARAM_PAGE = 'page'

let self = module.exports = {
	getTimeline: function(req, res) {
		let deputyId = req.param(PARAM_DEPUTY_ID);
		if (deputyId) {
			let page = req.param(PARAM_PAGE) ? req.param(PARAM_PAGE) : 0;
			return CacheService.getTimeline(deputyId, page)
			.then(function(cached) {
				if (cached) {
					return ResponseBuilder.build(res, cached.code, cached.content);
				} else {
					return self.getTimelineForDeputy(deputyId, parseInt(page))
					.then(function(result) {
						CacheService.setTimeline(deputyId, page, result);
						return ResponseBuilder.build(res, result.code, result.content);
					})
				}
			})
		} else {
			return ResponseBuilder.build(res, 400, 'Must provide deputyId as a parameter.')
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
					return TimelineResponseHelper.formatTimelineResponse(timelineItems, deputy)
				})
				.then(function(formattedItems) {
					return { code: 200, content: formattedItems }
				})
			}
		})
	}
};
