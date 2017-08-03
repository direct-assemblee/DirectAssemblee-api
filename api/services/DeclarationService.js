var Promise = require('bluebird')
var DateHelper = require('./helpers/DateHelper.js')

var findDeclarationsForDeputy = function(deputyId) {
    return Declaration.find()
        .where({ deputyId: deputyId })
}

module.exports = {
    getDeclarationsForDeputy: function(deputyId) {
        return findDeclarationsForDeputy(deputyId)
            .then(function(declarations) {
                for (i in declarations) {
                    delete declarations[i].deputyId
                    delete declarations[i].id
                    delete declarations[i].createdAt
                    delete declarations[i].updatedAt
                    declarations[i].date = DateHelper.formatDateForWS(declarations[i].date)
                }
                return declarations
            })
    }
}
