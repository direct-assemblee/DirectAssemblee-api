let DateHelper = require('./helpers/DateHelper.js');

module.exports = {
	findDeputyWithId: function(deputyId) {
		return Deputy.findOne().where({
			officialId: deputyId
		})
	},

	findMostRecentDeputyAtDate: function(departmentId, district, date) {
		let options = { departmentId: departmentId, district: district, currentMandateStartDate: { '<=': date } };
		return Deputy.find()
		.where(options)
		.then(function(deputies) {
			return getMostRecentDeputy(deputies);
		})
	},

	findCurrentDeputies: function() {
		var options = { currentMandateStartDate:  {'!': null}, mandateEndDate: null };
		return Deputy.find()
		.where(options);
	}
};

let getMostRecentDeputy = function(deputies) {
	if (deputies && deputies.length > 0) {
		deputies.sort(function(a, b) {
			let diff = DateHelper.getDiffInDays(a.currentMandateStartDate, b.currentMandateStartDate);
			return diff == 0 ? 0 : diff > 0 ? 1 : -1;
		});
		return deputies[0];
	}
}
