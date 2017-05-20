var cron = require('node-cron');
var Promise = require("bluebird");
var moment = require('moment');
var storage = require('node-persist');
var VoteService = require("./VoteService");

const EVERY_MINUTE = '* * * * *';
const EVERY_HOUR = '1 * * * *';

const LAST_SCAN_TIME_KEY = "LAST_SCAN_TIME_KEY";
var YESTERDAY = moment().subtract(1, 'days').format("YYYY-MM-DD");

var self = module.exports = {
  startService: function() {
    cron.schedule(EVERY_HOUR, function() {
      console.log('start looking for new votes');
      self.findNewVotes()
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
    lastScanTime = YESTERDAY;
    return lastScanTime;
  });
};

var pushNewVotes = function(lastScanTime) {
  return VoteService.findLastVotesByDeputy(lastScanTime)
  .then(function(lastVotesByDeputy) {
    if (lastVotesByDeputy) {
      return Promise.map(lastVotesByDeputy, function(deputyVotes) {
        console.log("- deputy " + deputyVotes.deputyId + " voted for " + deputyVotes.activities.length + " ballots to be pushed")
        return PushNotifService.pushDeputyActivities(deputyVotes);
      })
    }
  })
}

var pushNewWorks = function(lastScanTime) {
  return WorkService.findLastWorksByDeputy(lastScanTime)
  .then(function(lastWorksByDeputy) {
    if (lastWorksByDeputy) {
      return Promise.map(lastWorksByDeputy, function(deputyWorks) {
        console.log("- deputy " + deputyWorks.deputyId + " has " + deputyWorks.activities.length + " new works to be pushed")
        return PushNotifService.pushDeputyActivities(deputyWorks);
      })
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
