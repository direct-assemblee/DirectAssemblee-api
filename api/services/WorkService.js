var Promise = require("bluebird");
var DateHelper = require('./helpers/DateHelper.js');

module.exports = {
  findWorksForDeputyFromDate: function(deputyId, minDate, maxDate) {
    return Work.find()
    .where({ deputyId: deputyId, date: { '<=': minDate, '>': maxDate } })
    .then(function(works) {
      var cleanedWorks = [];
      for (i in works) {
        if (works[i]) {
          cleanedWorks.push(createWorkForTimeline(works[i]))
        }
      }
      return cleanedWorks;
    })
  }
}

var findWorksForDeputy = function(deputyId) {
  return Work.find()
  .where({ deputyId: deputyId });
}

var createWorkForTimeline = function(work) {
  return {
    type: work.type,
		date: DateHelper.formatDateForWS(work.date),
    title: work.title,
    description: work.description
  }
}
