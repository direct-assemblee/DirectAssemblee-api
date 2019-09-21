let storage = require('node-persist');
let DateHelper = require('./helpers/DateHelper.js');

const LAST_SCAN_TIME_KEY = 'LAST_SCAN_TIME_KEY';

var lastScanTime;

module.exports = {
    initLastScanTime: function() {
        return getLastScanTime()
        .then(function(date) {
            lastScanTime = date
        })
    },

    findNewWorksToPush: function(deputyId) {
        if (lastScanTime) {
            return WorkService.findLastWorksToPushForDeputy(deputyId, lastScanTime);
        } else {
            console.log('last scan time is undefined')
            return new Promise(function(resolve) {
                resolve()
            })
        }
    },

    findLast24hVotes: function() {
        return findVotesAfterDate(DateHelper.getYesterdaySameTime());
    },

    updateLastScanTime: function() {
        lastScanTime = DateHelper.getNowUtc();
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

let findVotesAfterDate = function(date) {
    let time = DateHelper.formatMomentWithTemplate(date, DateHelper.DATE_AND_HOUR_TEMPLATE);
    console.log('looking for votes after date : ' + time);
    return DeputyService.findCurrentDeputies()
    .then(function(deputies) {
        return VoteService.findLastVotesByDeputy(time, deputies)
    })
}

let getLastScanTime = function() {
    return storage.init()
    .then(function() {
        return storage.getItem(LAST_SCAN_TIME_KEY)
    })
    .then(function(time) {
        if (time) {
            console.log('retrieved last scan time from storage ' + time)
            return time;
        } else {
            let now = DateHelper.getNowUtc()
            console.log('no last scan time from storage : setting new one : ' + now)
            return storage.setItem(LAST_SCAN_TIME_KEY, now)
            .then(function() {
                return storage.getItem(LAST_SCAN_TIME_KEY)
            })
        }
    })
}
