var DateHelper = require('./helpers/DateHelper.js');
var MathHelper = require('./helpers/MathHelper.js');

const PARAM_DEPUTY_ID = "{deputy_id}";
const PARAM_MANDATE_NUMBER = "14";
const PARAM_LATITUDE = "{latitude}"
const PARAM_LONGITUDE = "{longitude}"
const BASE_URL = "http://www2.assemblee-nationale.fr/";
const DEPUTY_PHOTO_URL = BASE_URL + "static/tribun/" + PARAM_MANDATE_NUMBER + "/photos/" + PARAM_DEPUTY_ID + ".jpg"
const GEOLOC_URL = "http://localhost:1339/address/" + PARAM_LATITUDE + "/" + PARAM_LONGITUDE;

var self = module.exports = {
	findDeputyWithId: function(deputyId) {
		return Deputy.findOne().where({
			id: deputyId
		})
		.then(function(deputy) {
			return formatDeputyResponse(deputy);
		})
	},

	getDeputyForGeoDistrict: function(district) {
		var departmentCode = district.department;
		var circNumber = district.district;
		return DepartmentService.findDepartmentIdWithCode(departmentCode)
		.then(function(departmentId) {
			return self.findDeputiesForDistrict(departmentId, circNumber, true);
		})
		.then(function(deputies) {
			var deputiesInfos = [];
			for (i in deputies) {
				deputiesInfos.push(prepareSimpleDeputyResponse(deputies[i]));
			}
			return deputiesInfos;
		})
	},

	findDeputiesForDistrict: function(departmentId, district, onlyMandateInProgress) {
		var options = { departmentId: departmentId, district: district };
		if (onlyMandateInProgress) {
			options.currentMandateStartDate = {'!': null};
		}
		return Deputy.find()
		.where(options)
	},

	findDeputyAtDateFordistrict: function(departmentId, district, date) {
		return self.findDeputiesForDistrict(departmentId, district, false)
		.then(function(deputies) {
			var smallestDiff;
			var deputy;
			for (i in deputies) {
				var deputyDate = DateHelper.formatDateForWS( deputies[i].currentMandateStartDate)
				var diff = DateHelper.getDiff(date, deputyDate);
				if (diff > 0 && (diff < smallestDiff || !smallestDiff)) {
					smallestDiff = diff;
					deputy = deputies[i];
				}
			}
			return deputy;
		})
	}
};

var formatDeputyResponse = function(deputy) {
	if (deputy) {
		deputy.photoUrl = DEPUTY_PHOTO_URL.replace(PARAM_DEPUTY_ID, deputy.officialId)
		return MandateService.getPoliticalAgeOfDeputy(deputy.id, deputy.currentMandateStartDate)
		.then(function(parliamentAgeInYears) {
			deputy.parliamentAgeInYears = parliamentAgeInYears;
			return deputy;
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
				if (deputy.currentMandateStartDate) {
					deputy.currentMandateStartDate = DateHelper.formatDateForWS(deputy.currentMandateStartDate);
				}
				return prepareDeputyResponse(deputy);
			})
		})
	} else {
		return deputy;
	}
}

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

var prepareSimpleDeputyResponse = function(deputy) {
	deputy.photoUrl = DEPUTY_PHOTO_URL.replace(PARAM_DEPUTY_ID, deputy.officialId)
	deputy = prepareDeputyResponse(deputy);
	delete deputy.commission;
	delete deputy.phone;
	delete deputy.email;
	delete deputy.job;
	delete deputy.currentMandateStartDate;
	return deputy;
}

var prepareDeputyResponse = function(deputy) {
	delete deputy.officialId;
	delete deputy.gender;
	delete deputy.createdAt;
	delete deputy.updatedAt;
	delete deputy.mandateEndDate;
	delete deputy.mandateEndReason;
	deputy.departmentId = parseInt(deputy.departmentId)
	deputy.district = parseInt(deputy.district)
	return deputy;
}
