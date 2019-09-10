let Promise = require('bluebird');

let allSubthemes;

let self = module.exports = {
    findAll: function() {
        if (!allSubthemes) {
            return Subtheme.find()
            .populate('theme')
            .then(subthemes => {
                allSubthemes = subthemes;
                return allSubthemes
            })
        }
        return new Promise(resolve => resolve(allSubthemes))
    },

    find: async function(id) {
        if (allSubthemes == null) {
             await self.findAll();
        }
        var foundSubtheme = null
        allSubthemes.forEach(subtheme => {
            if (subtheme.id == id) {
                foundSubtheme = subtheme
            }
        })
        return foundSubtheme
    }
}
