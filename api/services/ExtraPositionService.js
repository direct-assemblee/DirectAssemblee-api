var Promise = require("bluebird");
var DateHelper = require('./helpers/DateHelper.js');

var findExtraPositionsForDeputy = function(deputyId) {
  return ExtraPosition.find()
  .where({ deputyId: deputyId });
}

module.exports = {
  
}
