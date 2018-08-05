let ThemeHelper = require('../controllers/helpers/ThemeHelper')

module.exports = {
    init: function() {
        ThemeHelper.initThemes();
        LastWorksService.initLastScanTime();
        if (process.env.NODE_APP_INSTANCE === '0') {
            PushNotifService.startDailyVotesCron();
            ActivityRateService.startUpdateCron();
            BackupService.startBackupCron();
        }
    }
}
