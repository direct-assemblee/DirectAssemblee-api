let themes = require('../../../assets/shortThemes.json').themes;

module.exports = {
    findShorterName: function(fullname) {
        for (let i in themes) {
            if (themes[i].fullname === fullname) {
                return themes[i].shortname;
            }
        }
    }
}
