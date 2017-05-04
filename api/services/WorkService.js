var Promise = require("bluebird");
var DateHelper = require('./helpers/DateHelper.js');

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

module.exports = {
  findWorksForDeputyFromDate: function(deputyId, minDate, maxDate) {
    return Work.find()
    .where({ deputyId: deputyId, date: { '<=': minDate, '>': maxDate } })
    .then(function(works) {
      var cleanedWorks = [];
      for (i in works) {
        cleanedWorks.push(createWorkForTimeline(works[i]))
      }
      return cleanedWorks;
    })
  }
}
