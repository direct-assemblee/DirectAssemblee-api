var Promise = require("bluebird");

module.exports = {
  findDepartmentIdWithCode: function(code) {
    return Department.findOne()
    .where({ code : code })
		.then(function(department) {
      return department.id;
    });
  }
}
