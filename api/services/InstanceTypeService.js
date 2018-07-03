let allTypes = []

module.exports = {
    find: function() {
        if (allTypes.length == 0) {
            return InstanceType.find()
            .then(function(types) {
                allTypes = types;
                return allTypes
            })
        } else {
            return new Promise(function(resolve) {
                resolve(allTypes)
            })
        }
    }
}
