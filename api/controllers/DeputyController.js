let Promise = require('bluebird');
let DateHelper = require('../services/helpers/DateHelper.js');
let ResponseHelper = require('../services/helpers/ResponseHelper.js');
let DepartmentService = require('../services/DepartmentService.js');
let GeolocService = require('../services/GeolocService.js');
let DeclarationService = require('../services/DeclarationService.js');
let MandateService = require('../services/MandateService.js');
let DeputyService = require('../services/DeputyService.js');
let CacheService = require('../services/CacheService.js');
let DeputyRolesHelper = require('../services/helpers/DeputyRolesHelper.js');
let SalaryHelper = require('./helpers/SalaryHelper.js');
let ResponseBuilder = require('./helpers/ResponseBuilder.js');
let DeputyResponseHelper = require('./helpers/DeputyResponseHelper.js');

const CACHE_KEY_ALL_DEPUTIES = 'all_deputies'
const CACHE_KEY_DEPUTY = 'deputy_departmentId_district'
const PARAM_LATITUDE = 'latitude'
const PARAM_LONGITUDE = 'longitude'
const PARAM_DEPARTMENT_ID = 'departmentId'
const PARAM_DISTRICT = 'district'

let self = module.exports = {
	getAllDeputiesResponse: function(req, res) {
		return self.getAllDeputies()
		.then(function(deputies) {
			return ResponseBuilder.build(res, 200, deputies)
		})
	},

	getAllDeputies: function() {
		return CacheService.get(CACHE_KEY_ALL_DEPUTIES)
		.then(function(cached) {
			if (!cached) {
				return DepartmentService.findDepartements()
				.then(function(departments) {
					return DeputyService.findCurrentDeputies()
					.then(function(allDeputies) {
						return DeputyResponseHelper.prepareSimpleDeputiesResponse(allDeputies, departments)
					})
				})
				.then(function(allDeputies) {
					CacheService.set(CACHE_KEY_ALL_DEPUTIES, allDeputies)
					return allDeputies
				})
			} else {
				return cached
			}
		})
	},

	getDeputiesResponse: function(req, res) {
		return self.getDeputies(req.param(PARAM_LATITUDE), req.param(PARAM_LONGITUDE))
		.then(function(response) {
			return ResponseBuilder.build(res, response.code, response.content)
		})
	},

	getDeputies: function(lat, long) {
		if (lat && long) {
			return getDeputiesWithCoordinates(lat, long);
		} else {
			return new Promise(function(resolve) {
				resolve({ code: 400, content: 'Must provide latitude and longitude arguments' });
			})
		}
	},

	getDeputyResponse: function(req, res) {
		let departmentId = req.param(PARAM_DEPARTMENT_ID);
		let district = req.param(PARAM_DISTRICT);
		let key = CACHE_KEY_DEPUTY.replace(PARAM_DEPARTMENT_ID, departmentId).replace(PARAM_DISTRICT, district);
		return CacheService.get(key)
		.then(function(cached) {
			if (!cached) {
				return self.getDeputy(departmentId, district)
				.then(function(response) {
					CacheService.set(key, response)
					return ResponseBuilder.build(res, response.code, response.content)
				})
			} else {
				return ResponseBuilder.build(res, cached.code, cached.content)
			}
		})
	},

	getDeputy: function(departmentId, district) {
		if (departmentId && district) {
			let formattedNow = DateHelper.getFormattedNow();
			return DeputyService.findMostRecentDeputyAtDate(departmentId, district, formattedNow)
			.then(function(deputy) {
				if (deputy) {
					if (deputy.mandateEndDate) {
						return { code: 404, content: 'Found deputy, but mandate has ended.' };
					} else {
						return retrieveDeputyAttachedInfos(deputy)
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
						if (deputy != null) {
							deputy.department = department
							deputy = DeputyResponseHelper.prepareSimpleDeputyResponse(deputy);
							CacheService.set(key, deputy)
							return deputy;
						} else {
							return { code: 404, content: 'Could not find deputy, sorry.' };
						}
					})
				}
			})
		} else {
			return cached
		}
	})
}

let retrieveDeputyAttachedInfos = function(deputy) {
	return DepartmentService.findDepartmentWithId(deputy.departmentId)
	.then(function(department) {
		deputy.department = department;
		return retrieveCurrentMandatesForDeputy(deputy);
	})
	.then(function(deputy) {
		return retrieveRolesForDeputy(deputy);
	})
	.then(function(deputy) {
		return retrieveParliamentAgeForDeputy(deputy);
	})
	.then(function(deputy) {
		return retrieveDeclarationsForDeputy(deputy);
	})
	.then(function(deputy) {
		return DeputyResponseHelper.prepareDeputyResponse(deputy);
	})
}

let retrieveCurrentMandatesForDeputy = function(deputy) {
	return MandateService.findCurrentMandates(deputy.officialId)
	.then(function(currentMandates) {
		let deputyOut = deputy;
		deputyOut.otherCurrentMandates = []
		for (let i in currentMandates) {
			deputyOut.otherCurrentMandates.push(currentMandates[i].name);
		}
		return deputyOut;
	})
}

let retrieveRolesForDeputy = function(deputy) {
	return DeputyRolesHelper.retrieveRolesForDeputy(deputy)
	.then(function(roles) {
		deputy.roles = roles;
		deputy.salary = SalaryHelper.calculateSalary(deputy.roles)
		return deputy
	})
}

let retrieveParliamentAgeForDeputy = function(deputy) {
	return MandateService.getPoliticalAgeOfDeputy(deputy.officialId, deputy.currentMandateStartDate)
	.then(function(parliamentAgeInMonths) {
		let deputyOut = deputy;
		deputyOut.parliamentAgeInMonths = parliamentAgeInMonths;
		return deputyOut;
	})
}

let retrieveDeclarationsForDeputy = function(deputy) {
	return DeclarationService.findDeclarationsForDeputy(deputy.officialId)
	.then(function(declarations) {
		let deputyOut = deputy;
		deputyOut.declarations = declarations;
		return deputyOut;
	})
}
