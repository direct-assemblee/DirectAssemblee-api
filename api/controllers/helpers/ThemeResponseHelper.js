let Promise = require('bluebird');
let ShortThemeHelper = require('./ShortThemeHelper.js')

var self = module.exports = {
    createThemeResponse: function(themeId) {
        return SubthemeService.find(themeId)
        .then(foundSubtheme => {
            if (foundSubtheme) {
                delete foundSubtheme.theme.typeName
                return foundSubtheme.theme
            } else {
                return {
                    id: 0,
                    name: 'Catégorisation à venir'
                }
            }
            return subtheme;
        })
    }
}
