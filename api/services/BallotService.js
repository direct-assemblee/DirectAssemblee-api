var Promise = require("bluebird");
var DateHelper = require('./helpers/DateHelper.js');

const NUMBER_OF_DEPUTIES = 577;
const BALLOTS_PAGE_ITEMS_COUNT = 30;

const BALLOT_TYPE_ORDINARY = { "shortname" : "SOR", "name" : "ordinary" };
const BALLOT_TYPE_SOLEMN = { "shortname" : "SSO", "name" : "solemn" };
const BALLOT_TYPE_OTHER = { "shortname" : "AUT", "name" : "others" };
const BALLOT_TYPE_CENSURE = { "shortname" : "motion_of_censure", "name" : "motion_of_censure" };
const BALLOT_TYPES = [ BALLOT_TYPE_ORDINARY, BALLOT_TYPE_SOLEMN, BALLOT_TYPE_OTHER, BALLOT_TYPE_CENSURE ];

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
    .where({ date: { '<=': minDate }, date: { '>': maxDate} })
    .then(function(ballots) {
      return Promise.map(ballots, function(ballot) {
          ballot.type = getBallotTypeName(ballot.type)
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
      simplifiedBallots.push(prepareSimplifiedBallotResponse(ballots[i]))
    }
    return simplifiedBallots;
  })
}

var prepareSimplifiedBallotResponse = function(ballot) {
  return {
    id: ballot.id,
    date: DateHelper.formatDateForWS(ballot.date),
    title: ballot.title,
    theme: ballot.theme,
    type: getBallotTypeName(ballot.type),
    isAdopted: ballot.isAdopted ? true : false
  }
}

var getBallotTypeName = function(ballotType) {
  var ballotTypeName;
  for (i in BALLOT_TYPES) {
    if (BALLOT_TYPES[i].shortname === ballotType) {
      ballotTypeName = BALLOT_TYPES[i].name;
      break;
    }
  }
  return ballotTypeName;
}

var findBallotsFromDate = function(searchedDate, solemnOnly) {
  var options = solemnOnly
    ? { date: { '>': searchedDate }, type: BALLOT_TYPE_SOLEMN }
    : { date: { '>': searchedDate } };
  return Ballot.find()
  .where(options)
}

var prepareBallotResponse = function(ballot) {
	delete ballot.createdAt;
	delete ballot.updatedAt;
  delete ballot.officialId;
  delete ballot.dateDetailed;
  delete ballot.analysisUrl;
  ballot.date = DateHelper.formatDateForWS(ballot.date);
  ballot.type = getBallotTypeName(ballot.type)
  ballot.totalVotes = parseInt(ballot.totalVotes);
  ballot.yesVotes = parseInt(ballot.yesVotes);
  ballot.noVotes = parseInt(ballot.noVotes);
  ballot.blankVotes = ballot.totalVotes - ballot.yesVotes - ballot.noVotes;
  ballot.missing = NUMBER_OF_DEPUTIES - ballot.totalVotes;
  ballot.isAdopted = ballot.isAdopted ? true : false;
	return ballot;
}
