let Promise = require('bluebird');
let DateHelper = require('./helpers/DateHelper.js');

module.exports = {
    findLastCreatedWorksWithThemeForDeputyAfterDate: function(deputyId, date) {
        let options = { createdAt: { '>=': date } }
        return findWorksForDeputyWithOptions(deputyId, options)
        .then(function(works) {
            return Promise.filter(works, function(work) {
                return DateHelper.isLaterOrSame(work.date, work.createdAt);
            })
        });
    },

    findWorksForDeputyBetweenDates: function(deputyId, afterDate,  beforeDate) {
        let options = { date: { '>': afterDate, '<=': beforeDate } }
        return findWorksForDeputyWithOptions(deputyId, options)
    }
}

let findWorksForDeputyWithOptions = function(deputyId, options) {
    return Work.find()
    .where(options)
    .populate('themeId')
    .populate('authors')
    .populate('participants')
    .then(function(works) {
        return Promise.filter(works, function(work) {
            return workHasDeputy(work, deputyId)
        })
    })
}

let workHasDeputy = function(work, deputyId) {
    return workContributorsContainsDeputyId(work.authors, deputyId) || workContributorsContainsDeputyId(work.participants, deputyId)
}

let workContributorsContainsDeputyId = function(contributors, deputyId) {
    let found = false;
    if (contributors && contributors.length) {
        for (let i in contributors) {
            if (contributors[i].officialId == deputyId) {
                found = true;
                break;
            }
        }
    }
    return found;
}
