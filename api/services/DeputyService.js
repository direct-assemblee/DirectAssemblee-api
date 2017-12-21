let DateHelper = require('./helpers/DateHelper.js');

module.exports = {
	findDeputyWithId: function(deputyId) {
		return Deputy.findOne().where({
			officialId: deputyId
		})
	},

	addSubscriber: function(deputyId, instanceId) {
		return Deputy.addToCollection(deputyId, 'subscribers')
		.members(instanceId)
	},

	removeSubscriber: function(deputyId, instanceId) {
		return Deputy.removeFromCollection(deputyId, 'subscribers')
		.members(instanceId)
	},

	findDeputyAndSubscribers: function(deputyId) {
		return Deputy.findOne({ officialId: deputyId })
		.populate('subscribers')
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
		var options = { currentMandateStartDate:  {'!=': ''}, mandateEndDate: '' };
		return Deputy.find()
		.where(options);
	},

	hasSubscribers: function(deputyId) {
		return DeputyService.findDeputyAndSubscribers(deputyId)
		.then(function(deputy) {
			return deputy && deputy.subscribers && deputy.subscribers.length > 0;
		})
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
