
let Promise = require('bluebird');
let DateHelper = require('../services/helpers/DateHelper.js');
let ResponseHelper = require('../services/helpers/ResponseHelper.js');
let DepartmentService = require('../services/DepartmentService.js');
let DeclarationService = require('../services/DeclarationService.js');
let MandateService = require('../services/MandateService.js');
let BallotService = require('../services/BallotService.js');
let VoteService = require('../services/VoteService.js');
let WorkService = require('../services/WorkService.js');
let DeputyService = require('../services/DeputyService.js');
let ExtraPositionService = require('../services/ExtraPositionService.js');

let self = module.exports = {
	getDeputies: function(req, res) {
		if (req.param('latitude') || req.param('longitude')) {
			return getDeputiesWithCoordinates(req, res);
		} else {
			return res.json(400, 'Must provide latitude and longitude arguments')
		}
	},

	getDeputy: function(req, res) {
		let departmentId = req.param('departmentId');
		let district = req.param('district');
		return self.getDeputyWithDistrict(departmentId, district)
		.then(function(deputyResponse) {
			if (deputyResponse.code === 200) {
				return res.json(deputyResponse.response);
			} else {
				return res.json(deputyResponse.code, deputyResponse.message);
			}
		})
	},

	getDeputyWithDistrict(departmentId, district) {
		if (departmentId && district) {
			let formattedNow = DateHelper.getFormattedNow();
			return DeputyService.findMostRecentDeputyAtDate(departmentId, district, formattedNow)
			.then(function(deputy) {
				if (deputy) {
					if (deputy.mandateEndDate) {
						return { code: 404, message: 'Found deputy, but mandate has ended.' };
					} else {
						return formatDeputyResponse(deputy)
						.then(function(formattedDeputy) {
							return { code: 200, response: formattedDeputy }
						});
					}
				} else {
					return { code: 404, message: 'Could not find deputy, sorry.' };
				}
			})
		} else {
			return { code: 400, message: 'Must provide departmentId and district arguments' };
		}
	}
}

let getDeputiesWithCoordinates = function(req, res) {
	return GeolocService.getAddress(req.param('latitude'), req.param('longitude'))
	.then(function(districts) {
		if (districts && districts.length > 0) {
			let deputies = []
			for (let i in districts) {
				deputies.push(DeputyService.getDeputyForGeoDistrict(districts[i]));
			}
			return Promise.all(deputies)
			.then(function(deputies) {
				let deputiesArray = [];
				for (let i in deputies) {
					for (let j in deputies[i]) {
						deputiesArray.push(deputies[i][j]);
					}
				}
				return res.json(deputiesArray);
			})
		} else {
			return res.json(404, 'Sorry, no district found');
		}
	})
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
	return DeclarationService.findDeclarationsForDeputy(deputyIn.officialId)
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
				return WorkService.findWorksDatesForDeputyAfterDate(deputy.officialId, deputy.currentMandateStartDate)
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
