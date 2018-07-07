let DateHelper = require('./helpers/DateHelper.js');

const GENDER_MALE = 'M'

let self = module.exports = {
    findAndSortByInstanceAndPosition: function(deputy) {
        return self.find(deputy.officialId)
        .then(function(foundRoles) {
            let roles = []
            for (let i in foundRoles) {
                let foundRole = foundRoles[i]
                let order = foundRole.instanceId.typeId
                if (roles[order] == null) {
                    roles[order] = {
                        instanceType: foundRole.instanceId.name,
                        positions: []
                    }
                }
                let positionId = foundRole.roleTypeId
                if (roles[order].positions[positionId] == null) {
                    roles[order].positions[positionId] = {
                        name: getPositionName(foundRole, deputy.gender),
                        instances: []
                    }
                }
                roles[order].positions[positionId].instances.push(foundRole.instanceId.name)
            }
            return roles
        })
    },

    find: function(deputyId) {
        return Role.find()
        .where({ deputyId: deputyId })
        .populate('roleTypeId')
        .populate('instanceId')
    }
}

let getPositionName = function(role, gender) {
    return gender === GENDER_MALE ? role.roleTypeId.maleName : role.roleTypeId.femaleName
}
