let allTypes

var self = module.exports = {
    findAll: function() {
        if (allTypes == null) {
            return WorkSubtype.find()
            .populate('parentTypeId')
            .then(types => {
                allTypes = types
                return types
            })
        } else {
            return new Promise(resolve => {
                resolve(allTypes)
            })
        }
    },

    find: async function(id) {
        var foundSubtype = null
        if (allTypes == null) {
            await self.findAll();
        }
        allTypes.forEach(subtype => {
            if (subtype.id == id) {
                foundSubtype = subtype
            }
        })
        return foundSubtype
    }
}
