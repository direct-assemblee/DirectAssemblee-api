module.exports = {
    findDepartmentWithCode: function(code) {
        return Department.findOne()
        .where({ code : code })
    },

    findDepartmentWithId: function(id) {
        return Department.findOne()
        .where({ id : id })
    }
}
