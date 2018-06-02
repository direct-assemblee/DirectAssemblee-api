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
            let time = DateHelper.formatMomentWithTemplate(lastScanTime, DateHelper.DATE_AND_HOUR_TEMPLATE);
            return WorkService.findLastCreatedWorksForDeputyAfterDate(deputyId, time);
        } else {
            console.log('last scan time is undefined')
        }
    },

    find24hVotes: function() {
        return findVotesAfterDate(DateHelper.getYesterdaySameTime());
    },

    updateLastScanTime: function() {
        lastScanTime = DateHelper.getNow();
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
    console.log('findVotesAfterDate ' + time)
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
            return storage.setItem(LAST_SCAN_TIME_KEY, DateHelper.getNow())
            .then(function() {
                return storage.getItem(LAST_SCAN_TIME_KEY)
            })
        }
    })
}
