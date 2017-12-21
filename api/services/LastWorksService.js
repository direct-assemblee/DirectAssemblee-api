let storage = require('node-persist');
let moment = require('moment');
let DateHelper = require('./helpers/DateHelper.js');

const LAST_SCAN_TIME_KEY = 'LAST_SCAN_TIME_KEY';

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

    find24hVotes: function() {
        return findVotesAfterDate(DateHelper.getYesterdaySameTime());
    },

    findNewVotes: function() {
        return getLastScanTime()
        .then(function(lastScanTime) {
            return findVotesAfterDate(lastScanTime);
        })
    },

    updateLastScanTime: function() {
        let lastScanTime = moment();
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
            return storage.setItem(LAST_SCAN_TIME_KEY, moment())
        }
    })
    .then(function(date) {
        return moment(date).utc();
    })
}
