var Promise = require("bluebird");
var DateHelper = require('./helpers/DateHelper.js');

module.exports = {
    getPoliticalAgeOfDeputy: function(deputyId, currentMandateStartDate) {
        return findMandatesForDeputy(deputyId)
        .then(function(mandates) {
            return getAllMandatesDuration(mandates, currentMandateStartDate)
        })
    }
}

var findMandatesForDeputy = function(deputyId) {
    return Mandate.find()
    .where({ deputyId: deputyId });
}

var getAllMandatesDuration = function(mandates, currentMandateStartDate) {
    var days = DateHelper.getDaysFromNow(currentMandateStartDate);
    for (i in mandates) {
        var mandate = mandates[i];
        days = days + DateHelper.getDurationInDays(mandate.startingDate, mandate.endingDate);
    }
    return DateHelper.convertDaysToYears(days);
}
