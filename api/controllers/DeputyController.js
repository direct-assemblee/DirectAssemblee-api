let Promise = require('bluebird');
let DateHelper = require('../services/helpers/DateHelper.js');
let ResponseHelper = require('../services/helpers/ResponseHelper.js');
let DepartmentService = require('../services/DepartmentService.js');
let GeolocService = require('../services/GeolocService.js');
let DeclarationService = require('../services/DeclarationService.js');
let MandateService = require('../services/MandateService.js');
let DeputyService = require('../services/DeputyService.js');
let ExtraPositionService = require('../services/ExtraPositionService.js');
let CacheService = require('../services/CacheService.js');

let self = module.exports = {
	getAllDeputiesResponse: function(req, res) {
		return self.getAllDeputies()
		.then(function(deputies) {
			return res.status(200).json(deputies);
		})
	},

	getDeputiesResponse: function(req, res) {
		return getDeputies(req.param('latitude'), req.param('longitude'))
		.then(function(response) {
			return res.status(response.code).json(response.content);
		})
	},

	getDeputyResponse: function(req, res) {
		let departmentId = req.param('departmentId');
		let district = req.param('district');
		let key = 'deputy_' + departmentId + '_' + district;
		return CacheService.get(key)
		.then(function(cached) {
			if (!cached) {
				return getDeputy(departmentId, district)
				.then(function(response) {
					CacheService.set(key, response)
					return res.status(response.code).json(response.content);
				})
			} else {
				return res.status(cached.code).json(cached.content);
			}
		})
	},

	getAllDeputies: function() {
		let key = 'all_deputies';
		return CacheService.get(key)
		.then(function(cached) {
			if (!cached) {
				return DepartmentService.findDepartements()
				.then(function(departments) {
					return DeputyService.findCurrentDeputies()
					.then(function(allDeputies) {
						return Promise.map(allDeputies, function(deputy) {
							let formattedDeputy = deputy;
							if (deputy) {
								deputy.department = findDepartmentForDeputy(deputy, departments);
								formattedDeputy = ResponseHelper.prepareSimpleDeputyResponse(deputy);
							}
							return formattedDeputy;
						}, { concurrency: 5 })
					})
					.then(function(allDeputies) {
						CacheService.set(key, allDeputies)
						return allDeputies
					})
				})
			} else {
				return cached
			}
		})
	}
}

let findDepartmentForDeputy = function(deputy, departments) {
	let department
	for (let i in departments) {
		if (departments[i].id === deputy.departmentId) {
			department = departments[i];
		}
	}
	return department;
}

let getDeputies = function(lat, long) {
	if (lat && long) {
		return getDeputiesWithCoordinates(lat, long);
	} else {
		return new Promise(function(resolve) {
			resolve({ code: 400, content: 'Must provide latitude and longitude arguments' });
		})
	}
}

let getDeputy = function(departmentId, district) {
	if (departmentId && district) {
		let formattedNow = DateHelper.getFormattedNow();
		return DeputyService.findMostRecentDeputyAtDate(departmentId, district, formattedNow)
		.then(function(deputy) {
			if (deputy) {
				if (deputy.mandateEndDate) {
					return { code: 404, content: 'Found deputy, but mandate has ended.' };
				} else {
					return formatDeputyResponse(deputy)
					.then(function(formattedDeputy) {
						return { code: 200, content: formattedDeputy };
					});
				}
			} else {
				return { code: 404, content: 'Could not find deputy, sorry.' };
			}
		})
	} else {
		return new Promise(function(resolve) {
			resolve({ code: 400, content: 'Must provide departmentId and district arguments' });
		})
	}
}

let getDeputiesWithCoordinates = function(lat, long) {
	return GeolocService.getDistricts(lat, long)
	.then(function(districts) {
		if (districts && districts.length > 0) {
			let deputies = []
			for (let i in districts) {
				deputies.push(retrieveDeputyForGeoDistrict(districts[i].department, districts[i].district));
			}
			return Promise.all(deputies)
			.then(function(deputies) {
				return Promise.filter(deputies, function(deputy) {
					return deputy != null;
				})
			})
			.then(function(deputies) {
				if (deputies && deputies.length > 0) {
					return { code: 200, content: deputies };
				} else {
					return { code: 404, content: 'No deputy found'}
				}
			})
		} else {
			return { code: 404, content: 'Sorry, no district found' };
		}
	})
}

let retrieveDeputyForGeoDistrict = function(departmentCode, district) {
	let key = 'deputy_simple_' + departmentCode + '_' + district;
	return CacheService.get(key)
	.then(function(cached) {
		if (!cached) {
			return DepartmentService.findDepartmentWithCode(departmentCode)
			.then(function(department) {
				if (department) {
					let formattedNow = DateHelper.getFormattedNow();
					return DeputyService.findMostRecentDeputyAtDate(department.id, district, formattedNow)
					.then(function(deputy) {
						let formattedDeputy = deputy;
						if (deputy) {
							deputy.department = department;
							formattedDeputy = ResponseHelper.prepareSimpleDeputyResponse(deputy);
						}
						CacheService.set(key, formattedDeputy)
						return formattedDeputy;
					})
				}
			})
		} else {
			return cached
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

let retrieveSalaryForDeputy = function(deputyIn) {
	return ExtraPositionService.getSalaryForDeputy(deputyIn.officialId)
	.then(function(salary) {
		let deputyOut = deputyIn;
		deputyOut.salary = salary;
		return deputyOut;
	})
}
