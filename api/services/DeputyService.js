let Promise = require('bluebird');
let DateHelper = require('./helpers/DateHelper.js');
let ResponseHelper = require('./helpers/ResponseHelper.js');

let self = module.exports = {
	findDeputyWithId: function(deputyId) {
		return Deputy.findOne().where({
			officialId: deputyId
		})
	},

	returnDeputyWithId: function(deputyId) {
		return self.findDeputyWithId(deputyId)
		.then(function(deputy) {
			if (deputy) {
				return formatDeputyResponse(deputy);
			}
		})
	},

	getDeputyForGeoDistrict: function(district) {
		let departmentCode = district.department;
		let circNumber = district.district;
		return DepartmentService.findDepartmentWithCode(departmentCode)
		.then(function(department) {
			return findDeputiesForDistrict(department.id, circNumber, true)
			.then(function(deputies) {
				let deputiesInfos = [];
				for (let i in deputies) {
					deputiesInfos.push(ResponseHelper.prepareSimpleDeputyResponse(deputies[i], department));
				}
				return deputiesInfos;
			})
		})
	},

	returnMostRecentDeputyAtDate: function(departmentId, district, date) {
		return self.findMostRecentDeputyAtDate(departmentId, district, date)
		.then(function(deputy) {
			if (deputy) {
				return formatDeputyResponse(deputy);
			}
		})
	},

	findMostRecentDeputyAtDate: function(departmentId, district, date) {
		return self.findDeputiesForDistrictAtDate(departmentId, district, date)
		.then(function(deputies) {
			if (deputies && deputies.length > 0) {
				return deputies[0];
			} else {
				return;
			}
		})
	},

	findDeputiesForDistrictAtDate: function(departmentId, district, date) {
		let options = { departmentId: departmentId, district: district, currentMandateStartDate: { '<=': date } };
		return Deputy.find()
		.where(options)
		.then(function(deputies) {
			if (deputies && deputies.length > 0) {
				deputies.sort(function(a, b) {
					let diff = DateHelper.getDiffInDays(a.currentMandateStartDate, b.currentMandateStartDate);
					return diff == 0 ? 0 : diff > 0 ? 1 : -1;
				});
			}

			return deputies;
		})
	},

	findCurrentDeputies: function() {
		var options = { currentMandateStartDate:  {'!': null}, mandateEndDate: null };
		return Deputy.find()
		.where(options);
	}
};

let findDeputiesForDistrict = function(departmentId, district,
	onlyMandateInProgress) {
	let options = { departmentId: departmentId, district: district };
	if (onlyMandateInProgress) {
		options.currentMandateStartDate = {'!': null};
	}
	return Deputy.find()
	.where(options)
}

let formatDeputyResponse = function(deputy) {
	if (deputy) {
		return DepartmentService.findDepartmentWithId(deputy.departmentId)
		.then(function(department) {
			return MandateService.getPoliticalAgeOfDeputy(deputy.officialId, deputy.currentMandateStartDate)
			.then(function(parliamentAgeInMonths) {
				deputy.parliamentAgeInMonths = parliamentAgeInMonths;
				return deputy;
			})
			.then(function(deputy) {
				return DeclarationService.getDeclarationsForDeputy(deputy.officialId)
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
				return ExtraPositionService.getSalaryForDeputy(deputy.officialId)
				.then(function(salary) {
					deputy.salary = salary;
					if (deputy.currentMandateStartDate) {
						deputy.currentMandateStartDate = DateHelper.formatDateForWS(deputy.currentMandateStartDate);
					}
					return ResponseHelper.prepareDeputyResponse(deputy, department);
				})
			})
		})
	} else {
		return deputy;
	}
}

let findActivityRate = function(deputy, solemnBallotsOnly) {
	return BallotService.findBallotsFromDate(deputy.currentMandateStartDate, solemnBallotsOnly)
	.then(function(allBallots) {
		if (allBallots && allBallots.length > 0) {
			return VoteService.findVotesBallotIds(deputy.officialId)
			.then(function(votesBallotsIds) {
				return Promise.filter(allBallots, function(ballot) {
					return !votesBallotsIds.includes(ballot.id);
				})
			})
			.then(function(missingBallots) {
				return WorkService.findWorksDatesForDeputyFromDate(deputy.officialId, deputy.currentMandateStartDate)
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
