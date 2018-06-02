let Promise = require('bluebird');
let DateHelper = require('./helpers/DateHelper.js');

module.exports = {
    findLastCreatedWorksForDeputyAfterDate: function(deputyId, date) {
        let options = { createdAt: { '>=': date } }
        return findWorksForDeputyWithOptions(deputyId, options)
        .then(function(works) {
            return Promise.filter(works, function(work) {
                return work && DateHelper.isLaterOrSame(work.date, work.createdAt);
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
    .then(function(works) {
        return Promise.map(works, function(work) {
            let author = workContributorsContainsDeputyId(work.authors, deputyId);
            let participant = workContributorsContainsDeputyId(work.participants, deputyId);
            if (author || participant) {
                if (work.type == Constants.WORK_TYPE_PROPOSITIONS && participant) {
                    work.type = Constants.WORK_TYPE_COSIGNED_PROPOSITIONS;
                } else if (work.type == Constants.WORK_TYPE_COSIGNED_PROPOSITIONS && author) {
                    work.type = Constants.WORK_TYPE_PROPOSITIONS;
                }
                return work
            }
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
