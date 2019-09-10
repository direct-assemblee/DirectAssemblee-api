let Promise = require('bluebird');
let ShortThemeHelper = require('./ShortThemeHelper.js')

var self = module.exports = {
    createThemeResponse: function(themeId) {
        return SubthemeService.find(themeId)
        .then(subtheme => {
            if (subtheme) {
                delete subtheme.theme.typeName;
            } else {
                subtheme = {
                    theme: {
                        id: 0,
                        name: 'Catégorisation à venir'
                    }
                }
            }
            return subtheme;
        })
    },
    //
    // createThemeResponse: function(themeId, originalName) {
    //     return ThemeService.getThemefromId(themeId)
    //     .then(function(theme) {
    //         if (theme) {
    //             delete theme.typeName;
    //         } else {
    //             theme = {
    //                 id: 0,
    //                 name: 'Catégorisation à venir'
    //             }
    //         }
    //         return theme;
    //     })
    // }
}
