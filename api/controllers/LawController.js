let Promise = require('bluebird');
let DeputyService = require('../services/DeputyService.js');
let LawService = require('../services/LawService.js');
let BallotService = require('../services/BallotService.js');
let VoteService = require('../services/VoteService.js');
let CacheService = require('../services/CacheService.js');
let LawResponseHelper = require('./helpers/LawResponseHelper.js');
let BallotHelper = require('../services/helpers/BallotHelper.js');
let ResponseBuilder = require('./helpers/ResponseBuilder.js');

const PARAM_DEPUTY_ID = 'deputyId'
const PARAM_LAW_ID = 'lawId'
const PARAM_TIMELINE_PAGE = 'page'

let self = module.exports = {
	getUndefinedBallots: function(req, res) {
		let deputyId = req.param(PARAM_DEPUTY_ID);
		let page = req.param(PARAM_TIMELINE_PAGE);
		if (deputyId && page) {

		}
	},

	getLawBallots: function(req, res) {
		let deputyId = req.param(PARAM_DEPUTY_ID);
		let lawId = req.param(PARAM_LAW_ID);
		if (deputyId && lawId) {
			return CacheService.getLawBallotsForDeputy(lawId, deputyId)
			.then(cached => {
				if (cached) {
					return ResponseBuilder.build(res, cached.code, cached.content);
				} else {
					return getLawBallotsForDeputy(lawId, deputyId)
					.then(formattedResponse => {
						let wholeResponse = { code: 200, content: formattedResponse };
						CacheService.setLawBallotsForDeputy(lawId, deputyId, wholeResponse);
						return wholeResponse
					})
					.then(result => ResponseBuilder.build(res, result.code, result.content))
					.catch(err => {
						console.log('getLawBallots error : ' + err);
						return ResponseBuilder.build(res, err.code, err.content)
					})
				}
			})
		} else {
			return ResponseBuilder.build(res, 400, 'Must provide deputyId and lawId as a parameter.')
		}
	}
};

let getLawBallotsForDeputy = function(lawId, deputyId) {
	return getValidDeputy(deputyId)
	.then(deputy => {
		return getLawBallots(lawId, deputyId)
		.then(lawWithBallots => LawResponseHelper.formatLawBallotsResponse(lawWithBallots, deputy))
	})
}

let getLawBallots = function(lawId, deputyId) {
	return CacheService.getLawBallots(lawId)
	.then(cached => {
		if (cached) {
			return cached;
		} else {
			return getValidLawWithBallots(lawId)
			.then(lawWithBallots => {
				return Promise.map(lawWithBallots.ballots, ballot => {
					return BallotHelper.getDeputyVote(deputyId, ballot)
				})
				.then(ballotsWithVotes => {
					lawWithBallots.ballots = ballotsWithVotes;
					CacheService.setLawBallots(lawId, lawWithBallots)
					return lawWithBallots;
				})
			})
		}
	})
}

let getValidDeputy = function(deputyId) {
	return DeputyService.findDeputyWithId(deputyId)
	.then(deputy => {
		if (!deputy) {
			return Promise.reject({ code: 404, content: 'No deputy found with id : ' + deputyId });
		} else if (!deputy.currentMandateStartDate) {
			return Promise.reject({ code: 404, content: 'Mandate has ended for deputy with id : ' + deputyId });
		} else {
			return deputy;
		}
	})
}

let getValidLawWithBallots = function(lawId) {
	return LawService.findLaw(lawId)
	.then(law => {
		if (!law) {
			return Promise.reject({ code: 404, content: 'No law found with id : ' + lawId });
		} else {
			return BallotService.findBallotsForLaw(law.id)
			.then(ballotsAndVotes => {
				law.ballots = ballotsAndVotes;
				return law;
			})
		}
	})
}
