var DateHelper = require('./helpers/DateHelper.js');
var MathHelper = require('./helpers/MathHelper.js');

const PARAM_DEPUTY_ID = "{deputy_id}";
const MANDATE_NUMBER = "14";
const BASE_URL = "http://www2.assemblee-nationale.fr/";
const DEPUTY_PHOTO_URL = BASE_URL + "static/tribun/" + MANDATE_NUMBER + "/photos/" + PARAM_DEPUTY_ID + ".jpg"

var self = module.exports = {
	getDeputyWithId: function(deputyId) {
		return Deputy.findOne().where({
			id: deputyId
		})
		.then(function(deputy) {
			deputy.photoUrl = DEPUTY_PHOTO_URL.replace(PARAM_DEPUTY_ID, deputy.officialId)
			var clearedDeputy = removeUnwantedFields(deputy);
			return MandateService.getPoliticalAgeOfDeputy(clearedDeputy.id)
			.then(function(parliamentAgeInYears) {
				clearedDeputy.parliamentAgeInYears = parliamentAgeInYears;
				return clearedDeputy;
			})
		})
		.then(function(deputy) {
			return DeclarationService.getDeclarationsForDeputy(deputy.id)
			.then(function(declarations) {
				deputy.declarations = declarations;
				return deputy;
			})
		})
		.then(function(deputy) {
			return findMissingRate(deputy, false)
			.then(function(missingRate) {
				deputy.missingRate = missingRate;
				return deputy;
			})
		})
		.then(function(deputy) {
			return ExtraPositionService.getSalaryForDeputy(deputy.id)
			.then(function(salary) {
				deputy.salary = salary;
				return deputy;
			})
		})
		.then(function(deputy) {
			deputy.currentMandateStartDate = DateHelper.formatDateForWS(deputy.currentMandateStartDate);
			return deputy;
		})
	}
};

var findMissingRate = function(deputy, solemnBallotsOnly) {
	return BallotService.findBallotsIdFromDate(deputy.currentMandateStartDate, solemnBallotsOnly)
	.then(function(ballots) {
		return VoteService.findVotes(deputy.id, solemnBallotsOnly)
		.then(function(votes) {
			var rate = 100 - (votes.length * 100 / ballots.length);
			return MathHelper.roundToTwoDecimals(rate);
		})
	})
}

var removeUnwantedFields = function(deputy) {
	delete deputy.officialId;
	delete deputy.gender;
	delete deputy.createdAt;
	delete deputy.updatedAt;
	return deputy;
}
