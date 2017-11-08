let Promise = require('bluebird');
let DateHelper = require('./helpers/DateHelper.js');

module.exports = {
    findWorksWithThemeForDeputyAfterDate: function(deputyId, date) {
        return findWorksForDeputyAfterDate(deputyId, date)
        .populate('themeId');
    },

    findLastCreatedWorksWithThemeForDeputyAfterDate: function(deputyId, date) {
        return Work.find()
        .where({ deputyId: deputyId, createdAt: { '>=': date } })
        .populate('themeId')
        .then(function(works) {
            return Promise.filter(works, function(work) {
                return DateHelper.isLaterOrSame(work.date, work.createdAt);
            })
        });
    },

    findWorksDatesForDeputyAfterDate: function(deputyId, date) {
        return findWorksForDeputyAfterDate(deputyId, date)
        .then(function(works) {
            return Promise.map(works, function(work) {
                return DateHelper.formatSimpleDate(work.date);
            })
        })
    },

    findWorksForDeputyBetweenDates: function(deputyId, afterDate,  beforeDate) {
        return Work.find()
        .where({ deputyId: deputyId, date: { '>': afterDate, '<=': beforeDate } })
        .populate('themeId')
        .then(function(works) {
            return Promise.map(works, function(work) {
                return ExtraInfoService.findExtraInfosForWork(work.id)
                .then(function(extraInfos) {
                    work.extraInfos = extraInfos;
                    return work;
                })
            })
        })
    }
}

let findWorksForDeputyAfterDate = function(deputyId, date) {
    return Work.find()
    .where({ deputyId: deputyId, date: { '>=': date } })
}
