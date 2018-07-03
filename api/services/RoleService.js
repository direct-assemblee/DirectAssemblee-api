let DateHelper = require('./helpers/DateHelper.js');

let self = module.exports = {
    findAndSort: function(deputyId) {
        return self.find(deputyId)
        .then(function(roles) {
            let instanceTypes = {}
            for (let i in roles) {
                let typeId = roles[i].instanceId.typeId
                if (instanceTypes[typeId] == null) {
                    instanceTypes[typeId] = {}
                    instanceTypes[typeId].instanceType = {}
                    instanceTypes[typeId].instanceType.id = typeId
                    instanceTypes[typeId].roles = []
                }
                instanceTypes[typeId].roles.push(roles[i])
            }
            return instanceTypes
        })
    },

    find: function(deputyId) {
        return Role.find()
        .where({ deputyId: deputyId })
        .populate('roleTypeId')
        .populate('instanceId')
    }
}
