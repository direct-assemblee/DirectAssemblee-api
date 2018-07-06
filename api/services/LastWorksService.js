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

    findNewWorks: function(deputyId) {
        if (lastScanTime) {
            return WorkService.findLastCreatedWorksForDeputyAfterDate(deputyId, lastScanTime);
        } else {
            console.log('last scan time is undefined')
            return new Promise(function(resolve) {
                resolve()
            })
        }
    },

    find24hVotes: function() {
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
            return time;
        } else {
            return storage.setItem(LAST_SCAN_TIME_KEY, DateHelper.getNowUtc())
            .then(function() {
                return storage.getItem(LAST_SCAN_TIME_KEY)
            })
        }
    })
}
