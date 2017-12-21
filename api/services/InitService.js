let ThemeHelper = require('./helpers/ThemeHelper')

module.exports = {
    init: function() {
        ThemeHelper.initThemes();
        PushNotifService.startDailyVotesCron();
    }
}
