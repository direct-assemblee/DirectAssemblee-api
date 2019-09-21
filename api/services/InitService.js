let ShortThemeHelper = require('../controllers/helpers/ShortThemeHelper')

module.exports = {
    init: function() {
        ShortThemeHelper.initThemes();
        LastWorksService.initLastScanTime();
        WorkSubtypeService.findAll();
        if (process.env.NODE_APP_INSTANCE === '0') {
            PushNotifService.startDailyVotesCron();
            ActivityRateService.startUpdateCron();
            BackupService.startBackupCron();
        }
    }
}
