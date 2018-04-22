let ThemeHelper = require('./helpers/ThemeHelper')

module.exports = {
    init: function() {
        if (process.env.NODE_APP_INSTANCE === '0') {
            ThemeHelper.initThemes();
            PushNotifService.startDailyVotesCron();
            ActivityRateService.startUpdateCron();
            LastWorksService.initLastScanTime();
        }
    }
}
