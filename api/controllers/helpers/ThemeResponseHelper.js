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
            if (shouldShowThemeSubName(theme.name, originalName)) {
                theme.fullName = originalName;
                theme.shortName = ShortThemeHelper.findShorterName(originalName);
            }
            return theme;
        })
    }
}

let shouldShowThemeSubName = function(themeName, originalThemeName) {
    let shouldShow = true;
    if (!originalThemeName || originalThemeName.length === 0) {
        shouldShow = false;
    } else if (themeName == originalThemeName) {
        shouldShow = false;
    } else {
        if (themeName !== undefined && themeName.toLowerCase().includes(originalThemeName.toLowerCase()) && (100 * originalThemeName.length / themeName.length >= 50)) {
            shouldShow = false;
        }
    }
    return shouldShow;
}
