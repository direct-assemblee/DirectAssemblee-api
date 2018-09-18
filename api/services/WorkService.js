let Promise = require('bluebird');
let DateHelper = require('./helpers/DateHelper.js');
let WorkAndBallotTypeHelper = require('./helpers/WorkAndBallotTypeHelper.js');

module.exports = {
    findLastWorksToPushForDeputy: function(deputyId, afterDate) {
        let options = { createdAt: { '>=': afterDate } }
        return findWorksForDeputyWithOptions(deputyId, options)
        .then(function(works) {
            return Promise.filter(works, function(work) {
                return work && DateHelper.isLaterOrSame(work.date, work.createdAt)
                    && WorkAndBallotTypeHelper.isEligibleForPush(work.type.displayName);
            })
        })
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
    .populate('type')
    .then(function(works) {
        return Promise.map(works, function(work) {
            let author = workContributorsContainsDeputyId(work.authors, deputyId);
            let participant = workContributorsContainsDeputyId(work.participants, deputyId);
            if (author || participant) {
                work.isAuthor = author
                return work
            }
        })
        .filter(function(work) {
            return work != null
        })
    })
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
