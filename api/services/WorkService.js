var Promise = require("bluebird");
var ResponseHelper = require('./helpers/ResponseHelper.js');
var DateHelper = require('./helpers/DateHelper.js');

module.exports = {
  findWorksForDeputyFromDate: function(deputyId, beforeDate, afterDate) {
    return Work.find()
    .where({ deputyId: deputyId, date: { '<=': beforeDate, '>': afterDate } })
    .then(function(works) {
      return Promise.map(works, function(work) {
        return ResponseHelper.createWorkForTimeline(work)
      })
    })
  },

  findLastWorksByDeputy: function(afterDate) {
    return Work.find()
		.where({ date: { '>=': lastScanTime }})
		.then(function(lastWorks) {
      if (lastWorks) {
        return mapWorksByDeputy(lastWorks);
      }
    })
  }
}

var findWorksForDeputy = function(deputyId) {
  return Work.find()
  .where({ deputyId: deputyId });
}

var mapWorksByDeputy = function(allWorks) {
	allWorks.sort(function(a, b) {
		return a.deputyId - b.deputyId;
	});

	var worksByDeputy = [];
	for (i in allWorks) {
		var work = allWorks[i];
		var picked = worksByDeputy.find(o => o.deputyId === work.deputyId);
		if (!picked) {
			picked = { 'deputyId': work.deputyId, 'activities': [] };
			worksByDeputy.push(picked);
		}
		delete work.deputyId;
		picked['activities'].push(work);
	}
	return worksByDeputy;
}
