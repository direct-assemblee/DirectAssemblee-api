var Promise = require("bluebird");

var self = module.exports = {
  findBallotsFromDate: function(searchedDate, solemnOnly) {
    var options = solemnOnly ? { date: { '>': searchedDate }, type: 'SSO' } : { date: { '>': searchedDate } };
    return Ballot.find()
    .where(options)
  },

  findBallotsIdFromDate: function(searchedDate, solemnOnly) {
    return self.findBallotsFromDate(searchedDate, solemnOnly)
    .then(function(ballots) {
      var ballotsIds = [];
      for (i in ballots) {
        ballotsIds.push(ballots[i].id)
      }
      return ballotsIds;
    })
  }
};
