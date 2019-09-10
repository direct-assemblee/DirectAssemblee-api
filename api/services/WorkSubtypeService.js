let allTypes = []

module.exports = {
    findAll: function() {
        if (allTypes.length == 0) {
            return WorkSubtype.find()
            .populate('parentTypeId')
            .then(types => {
                allTypes = allTypes.concat(types);

                return allTypes
            })
        } else {
            return new Promise(function(resolve) {
                resolve(allTypes)
            })
        }
    }
}
