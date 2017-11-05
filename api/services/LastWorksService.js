let storage = require('node-persist');
let moment = require('moment');
let DateHelper = require('./helpers/DateHelper.js');

const LAST_SCAN_TIME_KEY = 'LAST_SCAN_TIME_KEY';
let lastScanTime;

module.exports = {
    findNewWorks: function(deputyId) {
        return getLastScanTime()
        .then(function(lastScanTime) {
            if (lastScanTime) {
                let time = DateHelper.formatMomentWithTemplate(lastScanTime, DateHelper.DATE_AND_HOUR_TEMPLATE);
                return WorkService.findLastCreatedWorksWithThemeForDeputyAfterDate(deputyId, time);
            }
        })
    },

    findNewVotes: function() {
        return getLastScanTime()
        .then(function(lastScanTime) {
            return DeputyService.findCurrentDeputies()
            .then(function(deputies) {
                let time = DateHelper.formatMomentWithTemplate(lastScanTime, DateHelper.DATE_AND_HOUR_TEMPLATE);
                return VoteService.findLastVotesByDeputy(time, deputies)
            })
        })
    },

    updateLastScanTime: function() {
        lastScanTime = moment();
        return storage.init()
        .then(function() {
            return storage.setItem(LAST_SCAN_TIME_KEY, lastScanTime)
            .then(function() {
                return storage.getItem(LAST_SCAN_TIME_KEY)
            })
            .then(function(value) {
                console.log('updated last scan date : ' + value);
            })
        });
    }
}

let getLastScanTime = function() {
    if (lastScanTime) {
        return new Promise(function(resolve) {
            resolve(lastScanTime);
        })
    } else {
        return storage.init()
        .then(function() {
            return storage.getItem(LAST_SCAN_TIME_KEY)
        })
        .then(function(time) {
            if (time) {
                return time;
            } else {
                return storage.setItem(LAST_SCAN_TIME_KEY, moment())
            }
        })
    }
}
