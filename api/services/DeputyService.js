let DateHelper = require('./helpers/DateHelper.js');
let ResponseHelper = require('./helpers/ResponseHelper.js');

let self = module.exports = {
	findDeputyWithId: function(deputyId) {
		return Deputy.findOne().where({
			officialId: deputyId
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
