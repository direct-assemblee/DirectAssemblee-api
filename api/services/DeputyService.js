var Promise = require("bluebird");
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
			return DepartmentService.findDepartmentWithId(deputy.departmentId)
			.then(function(department) {
				return formatDeputyResponse(deputy, department);
			})
		})
	},

	getDeputyForGeoDistrict: function(district) {
		var departmentCode = district.department;
		var circNumber = district.district;
		return DepartmentService.findDepartmentWithCode(departmentCode)
		.then(function(department) {
			return self.findDeputiesForDistrict(department.id, circNumber, true)
			.then(function(deputies) {
				var deputiesInfos = [];
				for (i in deputies) {
					deputiesInfos.push(prepareSimpleDeputyResponse(deputies[i], department));
				}
				return deputiesInfos;
			})
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

	findDeputyAtDateForDistrict: function(departmentId, district, date) {
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
	},

	findDeputiesAtDate: function(date) {
		var options = { currentMandateStartDate:  {'!': null}, mandateEndDate: null };
		return Deputy.find()
		.where(options)
		.then(function(deputies) {
			return deputies;
		})
	}
};

var formatDeputyResponse = function(deputy, department) {
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
			return findActivityRate(deputy, false)
			.then(function(activityRate) {
				deputy.activityRate = activityRate;
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
				return prepareDeputyResponse(deputy, department);
			})
		})
	} else {
		return deputy;
	}
}

var findActivityRate = function(deputy, solemnBallotsOnly) {
	return BallotService.findBallotsFromDate(deputy.currentMandateStartDate, solemnBallotsOnly)
	.then(function(allBallots) {
		if (allBallots && allBallots.length > 0) {
			return VoteService.findVotesBallotIds(deputy.id)
			.then(function(votesBallotsIds) {
				return Promise.filter(allBallots, function(ballot) {
					return !votesBallotsIds.includes(ballot.id);
				})
			})
			.then(function(missingBallots) {
				return WorkService.findWorksDatesForDeputyFromDate(deputy.id, deputy.currentMandateStartDate)
				.then(function(worksDates) {
					return Promise.filter(missingBallots, function(missingBallot) {
						return !worksDates.includes(DateHelper.formatSimpleDate(missingBallot.date));
					})
					.then(function(definitelyMissing) {
						var rate = definitelyMissing.length * 100 / allBallots.length;
						return 100 - Math.round(rate);
					})
				})
			})
		}
	})
}

var prepareSimpleDeputyResponse = function(deputy, department) {
	deputy.photoUrl = DEPUTY_PHOTO_URL.replace(PARAM_DEPUTY_ID, deputy.officialId)
	deputy = prepareDeputyResponse(deputy, department);
	delete deputy.commission;
	delete deputy.phone;
	delete deputy.email;
	delete deputy.job;
	delete deputy.currentMandateStartDate;
	return deputy;
}

var prepareDeputyResponse = function(deputy, department) {
	delete deputy.officialId;
	delete deputy.gender;
	delete deputy.createdAt;
	delete deputy.updatedAt;
	delete deputy.mandateEndDate;
	delete deputy.mandateEndReason;
	deputy.seatNumber = parseInt(deputy.seatNumber)
	deputy.department = {}
	deputy.department.id = parseInt(department.id)
	deputy.department.code = department.code
	deputy.department.name = department.name
	deputy.district = parseInt(deputy.district)
	return deputy;
}
