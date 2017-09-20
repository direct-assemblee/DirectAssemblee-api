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
        .then(function(works) {
            return Promise.map(works, function(work) {
                return ResponseHelper.createWorkForTimeline(work)
            })
        })
    },

    findLastWorksByDeputy: function(afterDate) {
        return Work.find()
        .where({ date: { '>=': afterDate }})
        .then(function(lastWorks) {
            if (lastWorks) {
                return Promise.filter(lastWorks, function(work) {
                    return DateHelper.isLaterOrSame(work.createdAt, work.date);
                })
                .then(function(filteredWorks) {
                    return mapWorksByDeputy(filteredWorks);
                })
            }
        })
    }
}

let mapWorksByDeputy = function(allWorks) {
    allWorks.sort(function(a, b) {
        return a.deputyId - b.deputyId;
    });

    let worksByDeputy = [];
    for (let i in allWorks) {
        let work = allWorks[i];
        let picked = worksByDeputy.find(o => o.deputyId === work.deputyId);
        if (!picked) {
            picked = { 'deputyId': work.deputyId, 'activities': [] };
            worksByDeputy.push(picked);
        }
        delete work.deputyId;
        picked['activities'].push(work);
    }
    return worksByDeputy;
}
