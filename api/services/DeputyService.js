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
					deputies[i].department = department;
					deputiesInfos.push(ResponseHelper.prepareSimpleDeputyResponse(deputies[i]));
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
	},

	retrieveParliamentAgeForDeputy: function(deputy) {
		return retrieveParliamentAgeForDeputy(deputy);
	},

	retrieveDeclarationsForDeputy: function(deputy) {
		return retrieveDeclarationsForDeputy(deputy);
	},

	retrieveSalaryForDeputy: function(deputy) {
		return retrieveSalaryForDeputy(deputy);
	},

	retrieveActivityRateForDeputy: function(deputy) {
		return retrieveActivityRateForDeputy(deputy);
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
	return DepartmentService.findDepartmentWithId(deputy.departmentId)
	.then(function(department) {
		deputy.department = department;
		return retrieveParliamentAgeForDeputy(deputy);
	})
	.then(function(deputy) {
		return retrieveDeclarationsForDeputy(deputy);
	})
	.then(function(deputy) {
		return retrieveActivityRateForDeputy(deputy);
	})
	.then(function(deputy) {
		return retrieveSalaryForDeputy(deputy);
	})
	.then(function(deputy) {
		if (deputy.currentMandateStartDate) {
			deputy.currentMandateStartDate = DateHelper.formatDateForWS(deputy.currentMandateStartDate);
		}
		return ResponseHelper.prepareDeputyResponse(deputy);
	})
}

let retrieveParliamentAgeForDeputy = function(deputyIn) {
	return MandateService.getPoliticalAgeOfDeputy(deputyIn.officialId, deputyIn.currentMandateStartDate)
	.then(function(parliamentAgeInMonths) {
		let deputyOut = deputyIn;
		deputyOut.parliamentAgeInMonths = parliamentAgeInMonths;
		return deputyOut;
	})
}

let retrieveDeclarationsForDeputy = function(deputyIn) {
	return DeclarationService.getDeclarationsForDeputy(deputyIn.officialId)
	.then(function(declarations) {
		let deputyOut = deputyIn;
		deputyOut.declarations = declarations;
		return deputyOut;
	})
}

let retrieveActivityRateForDeputy = function(deputyIn) {
	return findActivityRate(deputyIn, false)
	.then(function(activityRate) {
		let deputyOut = deputyIn;
		deputyOut.activityRate = activityRate;
		return deputyOut;
	})
}

let retrieveSalaryForDeputy = function(deputyIn) {
	return ExtraPositionService.getSalaryForDeputy(deputyIn.officialId)
	.then(function(salary) {
		let deputyOut = deputyIn;
		deputyOut.salary = salary;
		return deputyOut;
	})
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
