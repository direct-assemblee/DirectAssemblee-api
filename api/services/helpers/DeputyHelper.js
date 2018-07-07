let Promise = require('bluebird');
let RoleService = require('../RoleService.js');
let InstanceTypeService = require('../InstanceTypeService.js');

const GENDER_MALE = 'M'

let self = module.exports = {
    retrieveRolesForDeputy: function(deputy) {
    	return RoleService.find(deputy.officialId)
    	.then(function(foundRoles) {
            return InstanceTypeService.find()
            .then(function(instanceTypes) {
                return sortRoles(deputy, foundRoles, instanceTypes)
            })
    	})
    }
}

let sortRoles = function(deputy, roles, instanceTypes) {
    let sortedResults = []
    for (let i in roles) {
        let role = roles[i]
        let typeId = role.instanceId.typeId
        if (sortedResults[typeId] == null) {
            sortedResults[typeId] = {
                instanceType: getTypeNameForInstance(typeId, instanceTypes),
                positions: []
            }
        }
        let positionId = role.roleTypeId.id
        if (sortedResults[typeId].positions[positionId] == null) {
            sortedResults[typeId].positions[positionId] = {
                name: getPositionName(role.roleTypeId, deputy.gender),
                instances: []
            }
        }
        sortedResults[typeId].positions[positionId].instances.push(role.instanceId.name)
    }
    for (let i in sortedResults) {
        sortedResults[i].positions = sortedResults[i].positions.filter(x => true)
    }
    return sortedResults.filter(x => true)
}

let getTypeNameForInstance = function(instanceTypeId, types) {
    for (let i in types) {
        if (types[i].id == instanceTypeId) {
            return types[i].singular
        }
    }
}

let getPositionName = function(roleType, gender) {
    return gender === GENDER_MALE ? roleType.maleName : roleType.femaleName
}
