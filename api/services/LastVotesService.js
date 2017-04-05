var cron = require('node-cron');
var Promise = require("bluebird");
var moment = require('moment');
var storage = require('node-persist');
var VoteService = require("./VoteService");

const EVERY_MINUTE = '* * * * *';
const EVERY_HOUR = '1 * * * *';

const LAST_SCAN_TIME_KEY = "LAST_SCAN_TIME_KEY";

var YESTERDAY = moment().subtract(100, 'days').format("YYYY-MM-DD");

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

var self = module.exports = {
  startService: function() {
    cron.schedule(EVERY_HOUR, function() {
      console.log('start looking for new votes');
      self.findNewVotes()
    });
  },

  findNewVotes: function() {
    initLastScanTime()
    .then(function(lastScanTime) {
      console.log(lastScanTime)
      VoteService.findLastVotesByDepute(lastScanTime)
      .then(function(lastVotesByDepute) {
        console.log("found " + lastVotesByDepute.length + " deputes who voted since " + lastScanTime)
        for (i in lastVotesByDepute) {
          var deputeVotes = lastVotesByDepute[i];
          console.log("- depute " + deputeVotes.depute.name + " voted for " + deputeVotes.votes.length + " laws")
          return PushNotifService.pushDeputeVotes(deputeVotes);
        }
      })
      .then(function() {
        self.updateLastScanTime();
      });
    });
  },

  updateLastScanTime: function() {
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
}
