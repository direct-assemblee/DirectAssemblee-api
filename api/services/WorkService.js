let Promise = require('bluebird');
let ResponseHelper = require('./helpers/ResponseHelper.js');
let DateHelper = require('./helpers/DateHelper.js');

let self = module.exports = {
    findWorksWithThemeForDeputyAfterDate: function(deputyId, date) {
        return findWorksForDeputyAfterDate(deputyId, date)
        .populate('themeId');
    },

    findLastCreatedWorksWithThemeForDeputyAfterDate: function(deputyId, date) {
        return self.findWorksWithThemeForDeputyAfterDate(deputyId, date)
        .then(function(works) {
            return Promise.filter(works, function(work) {
                return DateHelper.isLaterOrSame(work.createdAt, work.date);
            })
        })
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
