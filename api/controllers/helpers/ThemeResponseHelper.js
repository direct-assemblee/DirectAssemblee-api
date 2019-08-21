let Promise = require('bluebird');
let ShortThemeHelper = require('./ShortThemeHelper.js')

var self = module.exports = {
    createThemeResponse: function(themeId, originalName) {
        return ThemeService.getThemefromId(themeId)
        .then(function(theme) {
            if (theme) {
                delete theme.typeName;
            } else {
                theme = {
                    id: 0,
                    name: 'Catégorisation à venir'
                }
            }
            return theme;
        })
    }
}
