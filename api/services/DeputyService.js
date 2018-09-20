let Promise = require('bluebird');
let DateHelper = require('./helpers/DateHelper.js');

var self = module.exports = {
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
		.populate('parliamentGroup')
		.then(function(deputies) {
			if (deputies && deputies.length > 0) {
				return Promise.filter(deputies, function(deputy) {
					return deputies.length > 1 ? deputy.currentMandateStartDate && deputy.currentMandateStartDate.length > 0 : true;
				})
				.then(function(deputies) {
					return getMostRecentDeputy(deputies);
				})
			}
		})
	},

	findCurrentDeputies: function() {
		var options = { currentMandateStartDate:  {'!=': ''}, mandateEndDate: '' };
		return Deputy.find()
		.where(options)
		.populate('parliamentGroup')
		.sort('lastname ASC');
	},

	findGroupedDeputies: function() {
		return self.findCurrentDeputies()
		.then(deputies => {
			var groups = new Map()
			var nonGrouped = { id: 0, name: 'Non-inscrits' }
			for (let i in deputies) {
				let deputy = deputies[i]
				let group = deputy.parliamentGroup
				if (!group) {
					group = nonGrouped
				}
				if (!groups.has(group.id)) {
					groups.set(group.id, { group: group, deputies: [] })
				}
				groups.get(group.id).deputies.push(deputy)
			}
			return groups
		})
	},

	hasSubscribers: function(deputyId) {
		return self.findDeputyAndSubscribers(deputyId)
		.then(function(deputy) {
			return deputy && deputy.subscribers && deputy.subscribers.length > 0;
		})
	},

	findDeputyWithWorks: function(deputyId) {
		return Deputy.findOne()
		.where({ officialId: deputyId })
		.populate('workParticipations')
		.populate('workCreations');
	},

	findWorksForDeputy: function(deputyId) {
		return self.findDeputyWithWorks(deputyId)
		.then(function(deputy) {
			let works = deputy.workParticipations.concat(deputy.workCreations)
			return Promise.filter(works, function(work) {
				return DateHelper.isLaterOrSame(work.date, deputy.currentMandateStartDate)
			})
		})
	},

	updateDeputyWithRate: function(deputyId, rate) {
		return Deputy.update()
		.where({ officialId: deputyId })
		.set({ 'activityRate': rate })
		.then(function() {
			return;
		})
		.catch(err => {
			console.log('Error updating activity rate ' + err);
			return
		});
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
