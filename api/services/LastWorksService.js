var cron = require('node-cron');
var Promise = require("bluebird");
var moment = require('moment');
var storage = require('node-persist');
var VoteService = require("./VoteService");

const CRON_TIMES = '0 11,16,19 * * *';

const LAST_SCAN_TIME_KEY = "LAST_SCAN_TIME_KEY";
var YESTERDAY = moment().subtract(1, 'days').format("YYYY-MM-DD");

var self = module.exports = {
    startService: function() {
        cron.schedule(CRON_TIMES, function() {
            console.log('start looking for new activities');
            self.pushNewActivity()
        });
    },

    pushNewActivity: function() {
        initLastScanTime()
        .then(function(lastScanTime) {
            console.log("last scan time : " + lastScanTime)
            return pushNewVotes(lastScanTime)
            .then(function() {
                return pushNewWorks(lastScanTime)
            })
            .then(function() {
                updateLastScanTime();
            });
        });
    }
}

var initLastScanTime = function() {
    return storage.init()
    .then(function() {
        return storage.getItem(LAST_SCAN_TIME_KEY)
    })
    .then(function(time) {
        if (time) {
            lastScanTime = time;
        } else {
            lastScanTime = YESTERDAY;
        }
        return lastScanTime;
    });
};

var pushNewVotes = function(lastScanTime) {
    return DeputyService.findDeputiesAtDate(lastScanTime)
    .then(function(deputies) {
        return VoteService.findLastVotesByDeputy(lastScanTime, deputies)
        .then(function(lastVotesByDeputy) {
            if (lastVotesByDeputy) {
                return Promise.map(lastVotesByDeputy, function(deputyVotes) {
                    console.log("- deputy " + deputyVotes.deputyId + " voted for " + deputyVotes.activities.length + " ballots to be pushed")
                    return PushNotifService.pushDeputyActivities(deputyVotes);
                }, {concurrency: 10})
            }
        })
    })
}

var pushNewWorks = function(lastScanTime) {
    return WorkService.findLastWorksByDeputy(lastScanTime)
    .then(function(lastWorksByDeputy) {
        if (lastWorksByDeputy) {
            return Promise.map(lastWorksByDeputy, function(deputyWorks) {
                console.log("- deputy " + deputyWorks.deputyId + " has " + deputyWorks.activities.length + " new works to be pushed")
                return PushNotifService.pushDeputyActivities(deputyWorks);
            }, {concurrency: 10})
        }
    })
}

var updateLastScanTime = function() {
    storage.init()
    .then(function() {
        //then start using it
        storage.setItem(LAST_SCAN_TIME_KEY, new Date())
        .then(function() {
            return storage.getItem(LAST_SCAN_TIME_KEY)
        })
        .then(function(value) {
            console.log("updated last scan date : " + value);
        })
    });
}
