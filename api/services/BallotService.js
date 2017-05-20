var Promise = require("bluebird");
var ResponseHelper = require('./helpers/ResponseHelper.js');

const NUMBER_OF_DEPUTIES = 577;
const BALLOTS_PAGE_ITEMS_COUNT = 30;

const BALLOT_TYPE_SOLEMN = "SSO";

var self = module.exports = {
  findBallots: function(page) {
    var offset = BALLOTS_PAGE_ITEMS_COUNT * page;
    return findBallotsWithOffset(offset);
  },

  getBallotWithId: function(id) {
    return Ballot.findOne({ id: id })
    .then(function(ballot) {
      if (ballot) {
        return VoteService.findVotesForBallot(ballot.id, "non-voting")
        .then(function(nonVoting) {
          ballot.nonVoting = nonVoting.length;
          return prepareBallotResponse(ballot);
        })
      } else {
        return;
      }
    })
  },

  findBallotsIdFromDate: function(searchedDate, solemnOnly) {
    return findBallotsFromDate(searchedDate, solemnOnly)
    .then(function(ballots) {
      var ballotsIds = [];
      for (i in ballots) {
        ballotsIds.push(ballots[i].id)
      }
      return ballotsIds;
    })
  },

  findBallotsBetweenDates: function(minDate, maxDate) {
    return Ballot.find()
    .where({ date: { '<=': minDate , '>': maxDate} })
    .then(function(ballots) {
      return Promise.map(ballots, function(ballot) {
          ballot.type = ResponseHelper.getBallotTypeName(ballot.type)
          return ballot
      });
    })
  }
};

var findBallotsWithOffset = function(offset) {
  return Ballot.find()
  .limit(BALLOTS_PAGE_ITEMS_COUNT)
  .skip(offset)
  .then(function(ballots) {
    var simplifiedBallots = [];
    for (i in ballots) {
      simplifiedBallots.push(ResponseHelper.prepareSimplifiedBallotResponse(ballots[i]))
    }
    return simplifiedBallots;
  })
}

var findBallotsFromDate = function(searchedDate, solemnOnly) {
  var options = solemnOnly
    ? { date: { '>': searchedDate }, type: BALLOT_TYPE_SOLEMN }
    : { date: { '>': searchedDate } };
  return Ballot.find()
  .where(options)
}
