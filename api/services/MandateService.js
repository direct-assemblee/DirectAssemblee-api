var Promise = require("bluebird");
var DateHelper = require('./helpers/DateHelper.js');

var findMandatesForDeputy = function(deputyId) {
  return Mandate.find()
  .where({ deputyId: deputyId });
}

var getAllMandatesDuration = function(mandates) {
  var days = 0;
  for (i in mandates) {
    var mandate = mandates[i];
    days = days + DateHelper.getDurationInDays(mandate.startingDate, mandate.endingDate);
  }
  return DateHelper.convertDaysToYears(days);
}

module.exports = {
  getPoliticalAgeOfDeputy: function(deputyId) {
    return findMandatesForDeputy(deputyId)
    .then(function(mandates) {
      return getAllMandatesDuration(mandates)
    })
  }
}
