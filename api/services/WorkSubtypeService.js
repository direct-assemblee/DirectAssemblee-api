let allSubtypes = []

module.exports = {
    findAll: function() {
        return WorkSubtype.find()
        .populate('parentTypeId')
    }
}
