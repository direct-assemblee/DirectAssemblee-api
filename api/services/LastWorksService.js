let cron = require('node-cron');
let Promise = require('bluebird');
let moment = require('moment');
let storage = require('node-persist');
let VoteService = require('./VoteService');

const CRON_TIMES = '0 11,16,19 * * *';

const LAST_SCAN_TIME_KEY = 'LAST_SCAN_TIME_KEY';
let YESTERDAY = moment().subtract(1, 'days').format('YYYY-MM-DD');

let self = module.exports = {
    startService: function() {
        cron.schedule(CRON_TIMES, function() {
            console.log('start looking for new activities');
            self.pushNewActivity()
        });
    },

    pushNewActivity: function() {
        initLastScanTime()
        .then(function(lastScanTime) {
            console.log('last scan time : ' + lastScanTime)
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

let initLastScanTime = function() {
    return storage.init()
    .then(function() {
        return storage.getItem(LAST_SCAN_TIME_KEY)
    })
    .then(function(time) {
        let lastScanTime;
        if (time) {
            lastScanTime = time;
        } else {
            lastScanTime = YESTERDAY;
        }
        return lastScanTime;
    });
};

let pushNewVotes = function(lastScanTime) {
    return DeputyService.findCurrentDeputies()
    .then(function(deputies) {
        return VoteService.findLastVotesByDeputy(lastScanTime, deputies)
        .then(function(lastVotesByDeputy) {
            if (lastVotesByDeputy) {
                return Promise.map(lastVotesByDeputy, function(deputyVotes) {
                    console.log('- deputy ' + deputyVotes.deputyId + ' voted for ' + deputyVotes.activities.length + ' ballots to be pushed')
                    return PushNotifService.pushDeputyActivities(deputyVotes);
                }, {concurrency: 10})
            }
        })
    })
}

let pushNewWorks = function(lastScanTime) {
    return WorkService.findLastWorksByDeputy(lastScanTime)
    .then(function(lastWorksByDeputy) {
        if (lastWorksByDeputy) {
            return Promise.map(lastWorksByDeputy, function(deputyWorks) {
                console.log('- deputy ' + deputyWorks.deputyId + ' has ' + deputyWorks.activities.length + ' new works to be pushed')
                return PushNotifService.pushDeputyActivities(deputyWorks);
            }, {concurrency: 10})
        }
    })
}

let updateLastScanTime = function() {
    storage.init()
    .then(function() {
        //then start using it
        storage.setItem(LAST_SCAN_TIME_KEY, new Date())
        .then(function() {
            return storage.getItem(LAST_SCAN_TIME_KEY)
        })
        .then(function(value) {
            console.log('updated last scan date : ' + value);
        })
    });
}
