const GENDER_MALE = 'M'

module.exports = {
    formatRole: function(role, gender) {
        let roleName = gender === GENDER_MALE ? role.roleTypeId.maleName : role.roleTypeId.femaleName
        return { 'roleName' : roleName, 'instance': { 'type' : role.instanceId.typeName, 'name' : role.instanceId.name  } }
    }
}
