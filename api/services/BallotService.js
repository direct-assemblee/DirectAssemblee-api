var Promise = require("bluebird");
var DateHelper = require('./helpers/DateHelper.js');

const NUMBER_OF_DEPUTIES = 569;

const BALLOT_TYPE_ORDINARY = { "shortname" : "SOR", "name" : "ordinary" };
const BALLOT_TYPE_SOLEMN = { "shortname" : "SSO", "name" : "solemn" };
const BALLOT_TYPE_OTHER = { "shortname" : "AUT", "name" : "others" };
const BALLOT_TYPES = [ BALLOT_TYPE_ORDINARY, BALLOT_TYPE_SOLEMN, BALLOT_TYPE_OTHER ];

var self = module.exports = {
  getBallotWithId: function(id) {
    return Ballot.findOne({ id: id})
    .then(function(ballot){
      var clearedBallot = removeUnwantedFields(ballot);
      clearedBallot.date = DateHelper.formatDateForWS(ballot.date);
      clearedBallot.type = getBallotTypeName(ballot.type)
			return clearedBallot;
    })
    .then(function(ballot) {
      return VoteService.findVotesForBallot(ballot.id, "non-votant")
      .then(function(nonVoting) {
        ballot.totalVotes = parseInt(ballot.totalVotes);
        ballot.yesVotes = parseInt(ballot.yesVotes);
        ballot.noVotes = parseInt(ballot.noVotes);
        ballot.nonVoting = nonVoting.length;
        ballot.blankVotes = ballot.totalVotes - ballot.yesVotes - ballot.noVotes;
        ballot.missing = NUMBER_OF_DEPUTIES - ballot.totalVotes;
        return ballot;
      })
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
  }
};

var findBallotsFromDate = function(searchedDate, solemnOnly) {
  var options = solemnOnly ? { date: { '>': searchedDate }, type: BALLOT_TYPE_SOLEMN } : { date: { '>': searchedDate } };
  return Ballot.find()
  .where(options)
}

var removeUnwantedFields = function(ballot) {
	delete ballot.createdAt;
	delete ballot.updatedAt;
  delete ballot.officialId;
  delete ballot.dateDetailed;
  delete ballot.analysisUrl;
	return ballot;
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
