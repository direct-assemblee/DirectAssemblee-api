let Promise = require('bluebird');

let allThemes;

let self = module.exports = {
    getThemefromId: async function(id) {
        if (allThemes == null) {
            allThemes = await self.retrieveAll()
        }
        return Promise.filter(allThemes, function(theme) {
            return theme.id == id
        })
        .then(function(foundTypes) {
            if (foundTypes.length > 0) {
                return foundTypes[0]
            }
        })
    },

    retrieveAll: function() {
        return Theme.find()
    }
}
