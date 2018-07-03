const GENDER_MALE = 'M'

module.exports = {
    formatRole: function(role, gender) {
        let position = gender === GENDER_MALE ? role.roleTypeId.maleName : role.roleTypeId.femaleName
        return { 'position' : position, 'instanceName': role.instanceId.name }
    }
}
