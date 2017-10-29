let storage = require('node-persist');

const LAST_SCAN_TIME_KEY = 'LAST_SCAN_TIME_KEY';
let lastScanTime;

module.exports = {
    findNewWorks: function(deputyId) {
        return getLastScanTime()
        .then(function(lastScanTime) {
            if (lastScanTime) {
                return WorkService.findLastCreatedWorksWithThemeForDeputyAfterDate(deputyId, lastScanTime);
            }
        })
    },

    findNewVotes: function() {
        return getLastScanTime()
        .then(function(lastScanTime) {
            return DeputyService.findCurrentDeputies()
            .then(function(deputies) {
                console.log(deputies)
                return VoteService.findLastVotesByDeputy(lastScanTime, deputies)
            })
        })
    },

    updateLastScanTime: function() {
        lastScanTime = new Date();
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
                return storage.setItem(LAST_SCAN_TIME_KEY, new Date())
            }
        })
    }
}
