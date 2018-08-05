let ShortThemeService = require('../../services/ShortThemeService');

let shortThemes;

const REFRESH_PERIOD = 30*60*1000;

module.exports = {
    initThemes: function() {
        refreshShortThemes();
        setInterval(refreshShortThemes, REFRESH_PERIOD)
    },

    findShorterName: function(fullname) {
        for (let i in shortThemes) {
            if (shortThemes[i].fullName === fullname) {
                return shortThemes[i].shortName;
            }
        }
    }
}

let refreshShortThemes = function() {
    return ShortThemeService.findShortThemes()
    .then(function(themes) {
        shortThemes = themes;
    })
}
