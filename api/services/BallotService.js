var Promise = require("bluebird");

module.exports = {
  getBallotsIdFromDate: function(searchedDate) {
    return Ballot.find()
    .where({ date: { '>': searchedDate } })
    .then(function(ballots) {
      var ballotsIds = [];
      for (i in ballots) {
        ballotsIds.push(ballots[i].id)
      }
      return ballotsIds;
    })
  }
};
