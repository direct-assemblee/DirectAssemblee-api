let self = module.exports = {
    find: function(deputyId) {
        return Role.find()
        .where({ deputyId: deputyId })
        .populate('roleTypeId')
        .populate('instanceId')
    }
}
