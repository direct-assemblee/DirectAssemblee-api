let TimelineResponseHelper = require('./helpers/TimelineResponseHelper.js');
let TimelineResponseHelperV1 = require('./helpers/TimelineResponseHelperV1.js');
let DeputyService = require('../services/DeputyService.js');
let TimelineService = require('../services/TimelineService.js');
let TimelineServiceV1 = require('../services/TimelineServiceV1.js');
let CacheService = require('../services/CacheService.js');
let ResponseBuilder = require('./helpers/ResponseBuilder.js');

const PARAM_DEPUTY_ID = 'deputyId'
const PARAM_PAGE = 'page'

let self = module.exports = {
	getTimelineV1: function(req, res) {
		return self.getTimelineContent(req, res, true)
		.then(responseContent => {
			return ResponseBuilder.build(res, responseContent.code, responseContent.content);
		})
	},

	getTimeline: function(req, res) {
		return self.getTimelineContent(req, res)
		.then(responseContent => {
			return ResponseBuilder.build(res, responseContent.code, responseContent.content);
		})
	},

	getTimelineContent: function(req, res, v1) {
		let deputyId = req.param(PARAM_DEPUTY_ID);
		if (deputyId) {
			let page = req.param(PARAM_PAGE) ? req.param(PARAM_PAGE) : 0;
			return CacheService.getTimeline(deputyId, page, v1)
			.then(cached => {
				if (cached) {
					return { code: cached.code, content: cached.content };
				} else {
					return self.getTimelineForDeputy(deputyId, parseInt(page), v1)
					.then(result => {
						CacheService.setTimeline(deputyId, page, result, v1);
						return { code: result.code, content: result.content };
					})
				}
			})
		} else {
			return { code: 400, content: 'Must provide deputyId as a parameter.' };
		}
	},

	getTimelineForDeputy: function(deputyId, page, v1) {
		return DeputyService.findDeputyWithId(deputyId)
		.then(function(deputy) {
			if (!deputy) {
				return { code: 404, content: 'No deputy found with id : ' + deputyId };
			} else if (!deputy.currentMandateStartDate) {
				return { code: 404, content: 'Mandate has ended for deputy with id : ' + deputyId };
			} else {
				if (v1) {
					return TimelineServiceV1.getTimeline(deputy, page)
					.then(function(timelineItems) {
						return TimelineResponseHelperV1.formatTimelineResponse(timelineItems, deputy)
					})
					.then(function(formattedItems) {
						return { code: 200, content: formattedItems }
					})
				} else {
					return TimelineService.getTimeline(deputy, page)
					.then(function(timelineItems) {
						return TimelineResponseHelper.formatTimelineResponse(timelineItems, deputy)
					})
					.then(function(formattedItems) {
						return { code: 200, content: formattedItems }
					})
				}
			}
		})
	}
};
