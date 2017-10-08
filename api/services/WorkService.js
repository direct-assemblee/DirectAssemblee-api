let Promise = require('bluebird');
let ResponseHelper = require('./helpers/ResponseHelper.js');
let DateHelper = require('./helpers/DateHelper.js');

module.exports = {
    findWorksDatesForDeputyFromDate: function(deputyId, afterDate) {
        return Work.find()
        .where({ deputyId: deputyId, date: { '>': afterDate } })
        .then(function(works) {
            return Promise.map(works, function(work) {
                return DateHelper.formatSimpleDate(work.date);
            })
        })
    },

    findWorksForDeputyFromDate: function(deputyId, beforeDate, afterDate) {
        return Work.find()
        .where({ deputyId: deputyId, date: { '<=': beforeDate, '>': afterDate } })
        .populate('themeId')
        .then(function(works) {
            return Promise.map(works, function(work) {
                return ExtraInfoService.findExtraInfosForWork(work.id)
                .then(function(extraInfos) {
                    return ResponseHelper.createWorkForTimeline(work, extraInfos)
                })
            })
        })
    },

    findLastWorksForDeputy: function(deputyId, afterDate) {
        return Work.find()
        .where({ deputyId: deputyId, date: { '>=': afterDate }})
        .populate('themeId')
        .then(function(lastWorks) {
            if (lastWorks) {
                return Promise.filter(lastWorks, function(work) {
                    return DateHelper.isLaterOrSame(work.createdAt, work.date);
                })
                .then(function(filteredWorks) {
                    return filteredWorks;
                })
            }
        })
    }
}
