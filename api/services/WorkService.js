var Promise = require("bluebird");
var ResponseHelper = require('./helpers/ResponseHelper.js');

module.exports = {
  findWorksForDeputyFromDate: function(deputyId, minDate, maxDate) {
    return Work.find()
    .where({ deputyId: deputyId, date: { '<=': minDate, '>': maxDate } })
    .then(function(works) {
      return Promise.map(works, function(work) {
        return ResponseHelper.createWorkForTimeline(work)
      })
    })
  },

  findLastWorksByDeputy: function(lastScanTime) {
    return Work.find()
    .where({ date: { '<': lastScanTime } })
		.then(function(lastWorks) {
      return mapWorksByDeputy(lastWorks);
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
