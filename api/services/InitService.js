let ThemeHelper = require('./helpers/ThemeHelper')

module.exports = {
    init: function() {
        ThemeHelper.initThemes();
        PushNotifService.startDailyVotesCron();
        ActivityRateService.startUpdateCron();
        LastWorksService.initLastScanTime();
    }
}
