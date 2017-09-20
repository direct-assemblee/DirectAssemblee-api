let DateHelper = require('./helpers/DateHelper.js');

module.exports = {
    getPoliticalAgeOfDeputy: function(deputyId, currentMandateStartDate) {
        return findMandatesForDeputy(deputyId)
        .then(function(mandates) {
            return getAllMandatesDuration(mandates, currentMandateStartDate)
        })
    }
}

let findMandatesForDeputy = function(deputyId) {
    return Mandate.find()
    .where({ deputyId: deputyId });
}

let getAllMandatesDuration = function(mandates, currentMandateStartDate) {
    let days = DateHelper.getDaysFromNow(currentMandateStartDate);
    for (let i in mandates) {
        let mandate = mandates[i];
        days = days + DateHelper.getDiffInDays(mandate.startingDate, mandate.endingDate);
    }
    return DateHelper.convertDaysToMonths(days);
}
